import { Suspense } from "react";
import { ResetForm, ResetFormSkeleton } from "@/components/auth/reset-form";

export default function ResetPage() {
  return (
    <div className="flex h-screen items-center justify-center py-12">
      <div className="mx-auto w-full max-w-md px-4">
        <Suspense fallback={<ResetFormSkeleton />}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
