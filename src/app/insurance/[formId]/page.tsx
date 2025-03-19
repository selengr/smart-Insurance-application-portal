import DynamicForm from "@/components/dynamic-form/dynamic-form";




export default async function Page({
    params,
  }: {
    params: Promise<{ formId: string }>;
  }) {
    const { formId } = await params;

    return (
        <DynamicForm formId={formId}/>
    );
}
