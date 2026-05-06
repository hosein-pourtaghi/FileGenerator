
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