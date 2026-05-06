
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