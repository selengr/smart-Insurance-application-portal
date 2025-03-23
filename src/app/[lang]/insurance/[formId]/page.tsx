import { Card, CardContent } from "@/components/ui/card"
import DynamicFormV2 from "@/sections/dynamic-form/dynamic-form-v2";


export default async function Page({
    params,
  }: {
    params: Promise<{ formId: string; lang: string }>; 
  }) {
  const { formId, lang } = await params;
  
    

    return (
      <main className="container mx-auto py-10">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent>
              <DynamicFormV2 formId={formId} lang={lang}/>
            </CardContent>
          </Card>
        </div>
      </main>
    );
}
