
import { Routes } from '@angular/router';
import { AuthLayoutComponent } from '@layouts/auth-layout/auth-layout.component';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { 
        path: '', 
        redirectTo: 'login', 
        pathMatch: 'full' 
      },
      { 
        path: 'login', 
        loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) 
      },
      { 
        path: 'register', 
        loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent) 
      }
    ]
  }
];
src/app/features/auth/login/login.component.ts
typescript

        <a routerLink="/auth/register">ثبت نام کنید</a>
      </div>
    </form>
  `,
  styles: [`
    @use '../../../styles/variables' as vars;
    
    .login-form {
      h2 {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0 0 4px;
        text-align: center;
      }
      
      .subtitle {
        text-align: center;
        color: vars.$text-secondary;
        margin: 0 0 24px;
        font-size: 0.9rem;
      }
    }
    
    .form-field-full {
      width: 100%;
      margin-bottom: 8px;
    }
    
    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      
      a {
        color: vars.$primary-color;
        text-decoration: none;
        font-size: 0.875rem;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }
    
    .btn-full-width {
      height: 48px;
      font-size: 1rem;
      
      mat-spinner {
        display: inline-block;
      }
    }
    
    .form-footer {
      text-align: center;
      margin-top: 24px;
      color: vars.$text-secondary;
      
      a {
        color: vars.$primary-color;
        text-decoration: none;
        font-weight: 500;
        margin-right: 4px;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }
  `],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });

  hidePassword = signal(true);
  isLoading = signal(false);

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const { email, password } = this.form.value;

    this.authService.login({ email, password }).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: () => {
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }
}
src/app/features/auth/register/register.component.ts
typescript

        }
      a {
        color: vars.$primary-color;
        text-decoration: none;
        font-weight: 500;
        margin-right: 4px;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }
  `],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  hidePassword = signal(true);
  isLoading = signal(false);

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const { email, password, confirmPassword, firstName, lastName } = this.form.value;

    this.authService.register({
      email,
      password,
      confirmPassword,
      firstName,
      lastName
    }).subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }
}
14. Feature: Dashboard
src/app/features/dashboard/dashboard.component.ts
typescript

import { Component, OnInit, inject, signal } from '@angular/core';
        }
      }
      
      .activity-content {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        @include mixins.mobile {
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }
      }
      
      .activity-title {
        font-size: 0.9rem;
        color: vars.$text-primary;
      }
      
      .activity-time {
        font-size: 0.8rem;
        color: vars.$text-secondary;
      }
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `],
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    PageHeaderComponent
  ]
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  private api = inject(ApiService);

  stats = signal<StatCard[]>([
    { icon: 'people', title: 'کاربران', value: 156, color: '#673AB7', change: '+12%', changeType: 'positive' },
    { icon: 'admin_panel_settings', title: 'نقش‌ها', value: 8, color: '#009688', change: '+2', changeType: 'positive' },
    { icon: 'key', title: 'دسترسی‌ها', value: 45, color: '#FF9800' },
    { icon: 'devices', title: 'نشست‌های فعال', value: 23, color: '#4CAF50', change: '-5%', changeType: 'negative' }
  ]);

  recentActivities = [
    { id: 1, icon: 'person_add', title: 'کاربر جدید ثبت نام کرد', time: '۵ دقیقه پیش', bgColor: '#4CAF50' },
    { id: 2, icon: 'settings', title: 'تنظیمات سیستم بروزرسانی شد', time: '۱ ساعت پیش', bgColor: '#2196F3' },
    { id: 3, icon: 'logout', title: 'یک نشست غیرفعال شد', time: '۲ ساعت پیش', bgColor: '#FF9800' },
    { id: 4, icon: 'security', title: 'سطح دسترسی جدید اضافه شد', time: '۳ ساعت پیش', bgColor: '#9C27B0' }
  ];

  ngOnInit(): void {
    // Load dashboard data
  }
}
15. Feature: Roles
src/app/features/roles/roles.routes.ts
typescript

import { Routes } from '@angular/router';

export const ROLES_ROUTES: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./roles-list/roles-list.component').then(m => m.RolesListComponent) 
  },
  { 
    path: 'create', 
    loadComponent: () => import('./role-form/role-form.component').then(m => m.RoleFormComponent) 
  },
  { 
    path: 'edit/:id', 
    loadComponent: () => import('./role-form/role-form.component').then(m => m.RoleFormComponent) 
  },
  { 
    path: 'permissions/:id', 
    loadComponent: () => import('./role-permissions/role-permissions.component').then(m => m.RolePermissionsComponent) 
  }
];
src/app/features/roles/roles-list/roles-list.component.ts
typescript

import { Component, OnInit, inject, signal } from '@angular/core';
  currentPage = 1;
  searchQuery = '';

  displayedColumns = ['name', 'permissions', 'users', 'status', 'actions'];

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading.set(true);
    this.api.getPaginated<Role>('/Roles', {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      search: this.searchQuery
    }).subscribe({
      next: (response) => {
        if (response.items) {
          this.roles.set(response.items);
          this.totalCount.set(response.totalCount);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadRoles();
  }

  deleteRole(role: Role): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'حذف نقش',
        message: `آیا از حذف نقش "${role.name}" اطمینان دارید؟`,
        confirmText: 'حذف',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.api.delete('/Roles', role.id).subscribe({
          next: () => {
            this.toast.success('نقش با موفقیت حذف شد');
            this.loadRoles();
          }
        });
      }
    });
  }
}
src/app/features/roles/role-form/role-form.component.ts
typescript

import { Component, OnInit, inject, signal } from '@angular/core';
    });

    this.permissionGroups.set(
      Object.keys(groups).map(name => ({
        name,
        permissions: groups[name]
      }))
    );
  }

  isPermissionSelected(permissionId: string): boolean {
    return this.selectedPermissions().includes(permissionId);
  }

  togglePermission(permissionId: string, checked: boolean): void {
    const current = this.selectedPermissions();
    if (checked) {
      this.selectedPermissions.set([...current, permissionId]);
    } else {
      this.selectedPermissions.set(current.filter(id => id !== permissionId));
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const { name, description } = this.form.value;

    if (this.isEdit()) {
      const request: UpdateRoleRequest = {
        name,
        description,
        permissionIds: this.selectedPermissions()
      };