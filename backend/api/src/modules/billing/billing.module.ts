import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { CreditsModule } from '../credits/credits.module';
import Stripe from 'stripe';
import { STRIPE_CLIENT } from './billing.constants';

@Module({
  imports: [CreditsModule],
  controllers: [BillingController],
  providers: [
    BillingService,
    {
      provide: STRIPE_CLIENT,
      useFactory: () =>
        new Stripe(process.env.STRIPE_SECRET_KEY || '', {
          apiVersion: '2024-06-20' as Stripe.LatestApiVersion,
        }),
    },
  ],
  exports: [BillingService],
})
export class BillingModule {}
