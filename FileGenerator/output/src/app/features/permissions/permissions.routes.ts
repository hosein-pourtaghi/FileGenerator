
import { Routes } from '@angular/router';

export const PERMISSIONS_ROUTES: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./permissions-list/permissions-list.component').then(m => m.PermissionsListComponent) 
  }
];
src/app/features/permissions/permissions-list/permissions-list.component.ts
typescript

import { Component, OnInit, inject, signal } from '@angular/core';
  permissionGroups = signal<{ name: string; permissions: Permission[] }[]>([]);

  ngOnInit(): void {
    this.loadPermissions();
  }

  loadPermissions(): void {
    this.api.get<Permission[]>('/Permissions').subscribe({
      next: (response) => {
        if (response.data) {
          this.permissions.set(response.data);
          this.groupPermissions(response.data);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  groupPermissions(permissions: Permission[]): void {
    const groups: { [key: string]: Permission[] } = {};
    
    permissions.forEach(p => {
      const group = p.group || 'عمومی';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(p);
    });

    this.permissionGroups.set(
      Object.keys(groups).map(name => ({
        name,
        permissions: groups[name]
      }))
    );
  }

  getGroupIcon(groupName: string): string {
    const icons: { [key: string]: string } = {
      'کاربران': 'people',
      'نقش‌ها': 'admin_panel_settings',
      'دسترسی‌ها': 'key',
      'نشست‌ها': 'devices',
      'عمومی': 'settings',
      'Users': 'people',
      'Roles': 'admin_panel_settings',
      'Permissions': 'key',
      'Sessions': 'devices',
      'General': 'settings'
    };
    return icons[groupName] || 'folder';
  }
}
17. Feature: Sessions
src/app/features/sessions/sessions.routes.ts
typescript

import { Routes } from '@angular/router';

export const SESSIONS_ROUTES: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./sessions-list/sessions-list.component').then(m => m.SessionsListComponent) 
  }
];
src/app/features/sessions/sessions-list/sessions-list.component.ts
typescript

import { Component, OnInit, inject, signal } from '@angular/core';
          }
        });
      }
    });
  }

  terminateUserSessions(session: OnlineSession): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'پایان همه نشست‌ها',
        message: `آیا از پایان دادن تمام نشست‌های ${session.userFullName} اطمینان دارید؟`,
        confirmText: 'پایان همه',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.api.deleteWithParams('/Sessions/terminate-all', { userId: session.userId }).subscribe({
          next: () => {
            this.toast.success('نشست‌ها با موفقیت پایان یافت');
            this.loadOnlineSessions();
          }
        });
      }
    });
  }

  terminateAllSessions(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'پایان همه نشست‌ها',
        message: 'آیا از پایان دادن تمام نشست‌های همه کاربران اطمینان دارید؟',
        confirmText: 'پایان همه',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.api.delete('/Sessions/terminate-all').subscribe({
          next: () => {
            this.toast.success('همه نشست‌ها با موفقیت پایان یافت');
            this.loadOnlineSessions();
          }
        });
      }
    });
  }

  getDeviceIcon(deviceInfo: string): string {
    if (!deviceInfo) return 'devices';
    const lower = deviceInfo.toLowerCase();
    if (lower.includes('mobile') || lower.includes('android') || lower.includes('iphone')) {
      return 'smartphone';
    }
    if (lower.includes('tablet') || lower.includes('ipad')) {
      return 'tablet';
    }
    return 'computer';
  }

  formatDate(date: string): string {
    if (!date) return '-';
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'الان';
    if (minutes < 60) return `${minutes} دقیقه پیش`;
    if (hours < 24) return `${hours} ساعت پیش`;
    if (days < 7) return `${days} روز پیش`;
    
    return d.toLocaleDateString('fa-IR');
  }
}
18. Feature: Settings
src/app/features/settings/settings.component.ts
typescript

import { Component, inject, signal } from '@angular/core';
      }
      
      .setting-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        
        .setting-info {
          display: flex;
          flex-direction: column;
          
          .setting-title {
            font-weight: 500;
          }
          
          .setting-desc {
            font-size: 0.8rem;
            color: vars.$text-secondary;
          }
        }
        
        .language-select {
          width: 140px;
        }
      }
      
      mat-divider {
        margin: 4px 0;
      }
      
      mat-card-actions {
        padding: 16px 16px 0;
        
        button mat-spinner {
          display: inline-block;
        }
      }
    }
  `],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    PageHeaderComponent
  ]
})
export class SettingsComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  profileForm: FormGroup = this.fb.group({
    firstName: [this.authService.currentUser()?.firstName || ''],
    lastName: [this.authService.currentUser()?.lastName || ''],
    email: [{ value: this.authService.currentUser()?.email || '', disabled: true }]
  });

  savingProfile = signal(false);

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    
    this.savingProfile.set(true);