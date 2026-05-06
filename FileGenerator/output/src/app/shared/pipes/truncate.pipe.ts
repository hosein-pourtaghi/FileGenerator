
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: false
})
export class TruncatePipe implements PipeTransform {
  transform(value: string | null | undefined, limit: number = 50, trail: string = '...'): string {
    if (!value) return '';
    if (value.length <= limit) return value;
    return value.substring(0, limit) + trail;
  }
}
10. Shared Directives
src/app/shared/directives/permission.directive.ts
typescript

import { Directive, Input, TemplateRef, ViewContainerRef, inject, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appPermission]',
  standalone: false
})
export class PermissionDirective implements OnInit, OnDestroy {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private authService = inject(AuthService);
  private subscription?: Subscription;

  private permissions: string[] = [];
  private requireAll = false;
  private hasView = false;

  @Input() set appPermission(value: string | string[]) {
    this.permissions = Array.isArray(value) ? value : [value];
    this.updateView();
  }

  @Input() set appPermissionRequireAll(value: boolean) {
    this.requireAll = value;
    this.updateView();
  }

  ngOnInit(): void {
    this.updateView();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private updateView(): void {
    const hasPermission = this.requireAll
      ? this.permissions.every(p => this.authService.hasPermission(p))
      : this.permissions.some(p => this.authService.hasPermission(p));

    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
11. Layouts
src/app/layouts/main-layout/main-layout.component.ts
typescript

import { Component, OnInit, ViewChild, signal, computed } from '@angular/core';
  sidenavOpened = signal(true);

  navItems: NavItem[] = [
    { icon: 'dashboard', label: 'داشبورد', route: '/dashboard' },
    { icon: 'admin_panel_settings', label: 'نقش‌ها', route: '/roles', permission: 'view-roles' },
    { icon: 'key', label: 'دسترسی‌ها', route: '/permissions', permission: 'view-permissions' },
    { icon: 'devices', label: 'نشست‌ها', route: '/sessions' },
    { icon: 'settings', label: 'تنظیمات', route: '/settings' },
  ];

  sidenavMode = computed(() => this.isMobile() ? 'over' : 'side');
  sidenavOpened = computed(() => this.isMobile() ? false : true);

  userInitials = computed(() => {
    const name = this.authService.userFullName();
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2);
  });

  ngOnInit(): void {
    this.checkScreenSize();
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.isMobile()) {
        this.sidenav.close();
      }
    });

    window.addEventListener('resize', () => this.checkScreenSize());
  }

  private checkScreenSize(): void {
    this.isMobile.set(window.innerWidth < 960);
  }

  onSidenavClose(): void {
    if (this.isMobile()) {
      this.sidenavOpened.set(false);
    }
  }

  closeSidenavIfMobile(): void {
    if (this.isMobile()) {
      this.sidenav.close();
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
src/app/layouts/auth-layout/auth-layout.component.ts
typescript

import { Component } from '@angular/core';
    .auth-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
    }
    
    .auth-header {
      text-align: center;
      padding: 32px 32px 24px;
      background: linear-gradient(135deg, rgba(103, 58, 183, 0.05) 0%, rgba(0, 150, 136, 0.05) 100%);
      border-bottom: 1px solid vars.$border-color;
      
      .logo {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: linear-gradient(135deg, vars.$primary-color, vars.$accent-color);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 16px;
        
        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
          color: white;
        }
      }
      
      h1 {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0 0 8px;
        color: vars.$text-primary;
      }
      
      p {
        font-size: 0.875rem;
        color: vars.$text-secondary;
        margin: 0;
      }
    }
    
    .auth-content {
      padding: 32px;
      
      @include mixins.mobile {
        padding: 24px;
      }
    }
    
    .auth-footer {
      text-align: center;
      padding: 16px;
      
      p {
        margin: 0;
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.7);
      }
    }
  `],
  imports: [CommonModule, RouterModule, MatIconModule]
})
export class AuthLayoutComponent {}