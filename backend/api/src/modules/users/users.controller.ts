import { Controller, Get, Req, UseGuards, Post } from '@nestjs/common';
import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { UsersService } from './users.service';
import type { AuthenticatedRequest } from '../../common/types';

@Controller('users')
@UseGuards(ClerkAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@Req() req: AuthenticatedRequest) {
    const user = await this.usersService.findByClerkId(req.user.clerkId);
    return user;
  }

  @Post('onboarding/complete')
  async completeOnboarding(@Req() req: AuthenticatedRequest) {
    await this.usersService.completeOnboarding(req.user.id);
    return { success: true };
  }
}
