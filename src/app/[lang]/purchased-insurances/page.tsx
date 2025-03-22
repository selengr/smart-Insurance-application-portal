import { DynamicApplicationsList } from "@/sections/application-list/ dynamic-applications-list";

const page = () => {
    return (
        <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Insurance Applications</h1>
        <DynamicApplicationsList />
      </div>
    );
}

export default page;