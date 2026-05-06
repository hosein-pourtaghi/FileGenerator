
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ApiService } from '@core/services/api.service';
import { ToastService } from '@core/services/toast.service';
import { Role } from '@core/models/role.model';
import { Permission } from '@core/models/permission.model';

@Component({
  selector: 'app-role-permissions',
  standalone: false,
  template: `
        <app-page-header 
      [title]="'دسترسی‌های نقش ' + (role()?.name || '')" 
      subtitle="مدیریت دسترسی‌های نقش"
      icon="key"
      [breadcrumbs]="['نقش‌ها', role()?.name || '', 'دسترسی‌ها']">
    </app-page-header>

    <div class="card">
      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (role()) {
        <div class="permissions-header">
          <div class="role-info">
            <h3>{{ role()!.name }}</h3>
            <p>{{ role()!.description || 'بدون توضیحات' }}</p>
          </div>
          <div class="select-actions">
            <button mat-button (click)="selectAll()">انتخاب همه</button>
            <button mat-button (click)="deselectAll()">لغو همه</button>
          </div>
        </div>

        <div class="permissions-grid">
          @for (group of permissionGroups(); track group.name) {
            <div class="permission-group">
              <div class="group-header">
                <mat-checkbox 
                  [checked]="isGroupFullySelected(group.permissions)"
                  [indeterminate]="isGroupPartiallySelected(group.permissions)"
                  (change)="toggleGroup(group.permissions, $event.checked)">
                  <strong>{{ group.name }}</strong>
                </mat-checkbox>
              </div>
              <div class="group-permissions">
                @for (permission of group.permissions; track permission.id) {
                  <mat-checkbox 
                    [checked]="isPermissionSelected(permission.id)"
                    (change)="togglePermission(permission.id, $event.checked)"
                    color="primary">
                    <span class="permission-name">{{ permission.name }}</span>
                    @if (permission.description) {
                      <span class="permission-desc">{{ permission.description }}</span>
                    }
                  </mat-checkbox>
                }
              </div>
            </div>
          }
        </div>

        <div class="form-actions">
          <button mat-button routerLink="/roles">
            بازگشت
          </button>
          <button mat-flat-button color="primary" (click)="savePermissions()" [disabled]="saving()">
            @if (saving()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              ذخیره تغییرات
            }
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @use '../../../styles/variables' as vars;
    @use '../../../styles/mixins' as mixins;
    
    .card {
      background: white;
      border-radius: vars.$border-radius;
      box-shadow: vars.$box-shadow;
      padding: 24px;
    }
    
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }
    
    .permissions-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid vars.$border-color;
      
      @include mixins.mobile {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
      
      .role-info {
        h3 {
          margin: 0 0 4px;
          font-size: 1.25rem;
        }
        p {
          margin: 0;
          color: vars.$text-secondary;
          font-size: 0.875rem;
        }
      }
      
      .select-actions {
        display: flex;
        gap: 8px;
      }
    }
    
    .permissions-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin-bottom: 24px;
      
      @include mixins.tablet {
        grid-template-columns: repeat(2, 1fr);
      }
      
      @include mixins.mobile {
        grid-template-columns: 1fr;
      }
    }
    
    .permission-group {
      background: vars.$background-default;
      border-radius: vars.$border-radius;
      overflow: hidden;
      
      .group-header {
        padding: 12px 16px;
        background: rgba(103, 58, 183, 0.05);
        border-bottom: 1px solid vars.$border-color;
        
        strong {
          color: vars.$primary-color;
        }
      }
      
      .group-permissions {
        padding: 12px 16px;
        
        mat-checkbox {
          display: flex;
          margin-bottom: 8px;
          
          &:last-child {
            margin-bottom: 0;
          }
        }
        
        .permission-name {
          display: block;
        }
        
        .permission-desc {
          display: block;
          font-size: 0.75rem;
          color: vars.$text-secondary;
          margin-top: 2px;
        }
      }
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 16px;
      border-top: 1px solid vars.$border-color;
      
      button mat-spinner {
        display: inline-block;
      }
    }
  `],
  imports: [
    CommonModule,
    RouterModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    PageHeaderComponent
  ]
})
export class RolePermissionsComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  role = signal<Role | null>(null);
  loading = signal(true);
  saving = signal(false);
  allPermissions = signal<Permission[]>([]);
  selectedPermissions = signal<string[]>([]);

  permissionGroups = signal<{ name: string; permissions: Permission[] }[]>([]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadRole(id);
      this.loadPermissions();
    }
  }

  loadRole(id: string): void {
    this.api.getById<Role>('/Roles', id).subscribe({
      next: (response) => {
        if (response.data) {
          this.role.set(response.data);
          this.selectedPermissions.set(response.data.permissions?.map(p => p.id) || []);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  loadPermissions(): void {
    this.api.get<Permission[]>('/Permissions').subscribe({
      next: (response) => {
        if (response.data) {
          this.allPermissions.set(response.data);
          this.groupPermissions(response.data);
        }
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

  isGroupFullySelected(permissions: Permission[]): boolean {
    const ids = permissions.map(p => p.id);
    return ids.every(id => this.selectedPermissions().includes(id));
  }

  isGroupPartiallySelected(permissions: Permission[]): boolean {
    const ids = permissions.map(p => p.id);
    const selected = ids.filter(id => this.selectedPermissions().includes(id));
    return selected.length > 0 && selected.length < ids.length;
  }

  toggleGroup(permissions: Permission[], checked: boolean): void {
    const ids = permissions.map(p => p.id);
    if (checked) {
      const current = this.selectedPermissions();
      const newIds = [...new Set([...current, ...ids])];
      this.selectedPermissions.set(newIds);
    } else {
      const current = this.selectedPermissions();
      this.selectedPermissions.set(current.filter(id => !ids.includes(id)));
    }
  }

  selectAll(): void {
    this.selectedPermissions.set(this.allPermissions().map(p => p.id));
  }

  deselectAll(): void {
    this.selectedPermissions.set([]);
  }

  savePermissions(): void {
    const roleId = this.role()?.id;
    if (!roleId) return;

    this.saving.set(true);