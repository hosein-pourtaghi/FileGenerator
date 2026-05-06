
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