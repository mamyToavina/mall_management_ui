import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthStore } from "./auth.store";

export const roleGuard = (roles: string[]): CanActivateFn => {
    return () => {
      const store = inject(AuthStore);
      const router = inject(Router);
  
      if (!roles.includes(store.role()!)) {
        router.navigate(['/unauthorized']);
        return false;
      }
  
      return true;
    };
};
  