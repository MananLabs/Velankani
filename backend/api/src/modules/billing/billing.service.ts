// ═══════════════════════════════════════════════════════════
// VEL AI — Billing Service (Stripe Integration)
// ═══════════════════════════════════════════════════════════

import { Injectable, Logger, Inject } from '@nestjs/common';
import Stripe from 'stripe';
import { db } from '../../database/db';
import { users, subscriptions } from '../../database/schema';
import { eq } from 'drizzle-orm';
import { CreditsService } from '../credits/credits.service';
import { STRIPE_CLIENT } from './billing.constants';

const PLAN_CREDITS: Record<string, number> = {
  pro: 3000,
  pro_byok: 0,
  teams: 8000,
};

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly creditsService: CreditsService,
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe,
  ) {}

  async createCheckoutSession(
    userId: string,
    priceId: string,
    customerId?: string,
  ): Promise<string> {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId || undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.FRONTEND_URL}/billing?checkout=cancel`,
      metadata: { userId },
    });

    return session.url || '';
  }

  async createTopUpCheckout(
    userId: string,
    priceId: string,
    customerId?: string,
  ): Promise<string> {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customerId || undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/dashboard?topup=success`,
      cancel_url: `${process.env.FRONTEND_URL}/billing?topup=cancel`,
      metadata: { userId, type: 'top_up' },
    });

    return session.url || '';
  }

  async handleSubscriptionChange(sub: Stripe.Subscription): Promise<void> {
    const customerId =
      typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.stripeCustomerId, customerId || ''));

    if (!user) {
      this.logger.warn(`No user found for Stripe customer ${customerId}`);
      return;
    }

    const plan = this.extractPlanFromSubscription(sub);

    // Upsert subscription
    await db
      .insert(subscriptions)
      .values({
        userId: user.id,
        stripeSubscriptionId: sub.id,
        stripePriceId: sub.items.data[0]?.price?.id || '',
        plan,
        status: sub.status,
        currentPeriodStart: new Date(sub.current_period_start * 1000),
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      })
      .onConflictDoUpdate({
        target: subscriptions.userId,
        set: {
          stripeSubscriptionId: sub.id,
          plan,
          status: sub.status,
          currentPeriodStart: new Date(sub.current_period_start * 1000),
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          updatedAt: new Date(),
        },
      });

    // Update user plan
    await db
      .update(users)
      .set({
        plan: plan as 'free' | 'pro' | 'pro_byok' | 'teams' | 'enterprise',
        creditsMonthlyAlloc: PLAN_CREDITS[plan] || 100,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
  }

  async handleSubscriptionDeleted(sub: Stripe.Subscription): Promise<void> {
    const customerId =
      typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.stripeCustomerId, customerId || ''));

    if (!user) return;

    await db
      .update(users)
      .set({
        plan: 'free',
        creditsMonthlyAlloc: 100,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
  }

  async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    // Monthly credit allocation on successful payment
    const customerId =
      typeof invoice.customer === 'string'
        ? invoice.customer
        : invoice.customer?.id;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.stripeCustomerId, customerId || ''));

    if (!user) return;

    const monthlyCredits = PLAN_CREDITS[user.plan] || 100;
    await this.creditsService.addCredits(
      user.id,
      monthlyCredits,
      'monthly_allocation',
    );
  }

  async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    this.logger.warn(`Payment failed for invoice ${invoice.id}`);
  }

  async handleCheckoutCompleted(
    session: { metadata?: Record<string, string>; amount_total?: number; customer?: string | null },
  ): Promise<void> {
    const userId = session.metadata?.userId;
    if (!userId) return;

    if (session.metadata?.type === 'top_up') {
      const creditAmount = this.getCreditAmountFromPrice(
        session.amount_total || 0,
      );
      await this.creditsService.addCredits(userId, creditAmount, 'top_up');
    }

    if (session.customer) {
      const customerId = typeof session.customer === 'string' ? session.customer : '';
      await db
        .update(users)
        .set({ stripeCustomerId: customerId, updatedAt: new Date() })
        .where(eq(users.id, userId));
    }
  }

  private extractPlanFromSubscription(sub: Stripe.Subscription): string {
    const priceId = sub.items.data[0]?.price?.id || '';
    const priceMap: Record<string, string> = {
      [process.env.STRIPE_PRICE_PRO_MONTHLY || '']: 'pro',
      [process.env.STRIPE_PRICE_PRO_BYOK_MONTHLY || '']: 'pro_byok',
      [process.env.STRIPE_PRICE_TEAMS_MONTHLY || '']: 'teams',
    };
    return priceMap[priceId] || 'pro';
  }

  private getCreditAmountFromPrice(amountCents: number): number {
    const priceToCredits: Record<number, number> = {
      500: 500,
      1500: 2000,
      5000: 10000,
    };
    return priceToCredits[amountCents] || Math.floor(amountCents / 1);
  }
}
