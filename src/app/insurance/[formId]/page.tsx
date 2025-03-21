// import DynamicForm from "@/components/dynamic-form/dynamic-form";
import DynamicFormV2 from "@/components/dynamic-form/dynamic-form-v2";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


export default async function Page({
    params,
  }: {
    params: Promise<{ formId: string }>;
  }) {
    const { formId } = await params;
    

    return (
<main className="container mx-auto py-10">
<div className="max-w-3xl mx-auto">
  <Card>
    <CardContent>
      <DynamicFormV2 formId={formId} />
    </CardContent>
  </Card>
</div>
</main>
    );
}
