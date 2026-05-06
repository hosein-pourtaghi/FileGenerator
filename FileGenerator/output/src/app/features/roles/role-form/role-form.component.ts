
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