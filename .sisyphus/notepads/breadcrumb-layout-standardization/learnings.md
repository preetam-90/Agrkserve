## 2026-02-02 Initial Learnings

- We are using `Breadcrumb` component with specific helpers: `createDashboardBreadcrumb`, `createEquipmentBreadcrumb`, `createBookingBreadcrumb`, `createUserBreadcrumb`.
- Layout standard is `pt-16` for top padding (64px) and `max-w-[1600px]` for width.
- Build blockers were identified: unclosed `div` in `src/app/provider/earnings/page.tsx` and missing `vehicle_condition_rating` in `src/components/review-form.tsx`.
