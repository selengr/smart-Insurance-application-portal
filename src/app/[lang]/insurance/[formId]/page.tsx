import { Card, CardContent } from "@/components/ui/card"
import DynamicFormV2 from "@/components/dynamic-form/dynamic-form-v2";


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
