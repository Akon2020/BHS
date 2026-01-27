import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function AdminProfileLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 mt-2" />
      </div>

      <Separator />

      <div className="flex flex-col md:flex-row gap-6">
        <Card className="md:w-1/3">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48 mt-1" />
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="text-center space-y-2">
              <Skeleton className="h-6 w-40 mx-auto" />
              <Skeleton className="h-4 w-32 mx-auto" />
              <Skeleton className="h-4 w-24 mx-auto" />
            </div>
            <Skeleton className="h-9 w-32" />
          </CardContent>
        </Card>

        <div className="flex-1">
          <Skeleton className="h-10 w-full" />
          <div className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-64 mt-1" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </CardContent>
              <div className="p-6 pt-0">
                <Skeleton className="h-10 w-32" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
