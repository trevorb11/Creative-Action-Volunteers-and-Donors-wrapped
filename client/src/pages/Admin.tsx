import ImportForm from "@/components/admin/ImportForm";
import SegmentationTool from "@/components/admin/SegmentationTool";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Admin() {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-500">
          Import and manage donor data
        </p>
      </div>
      
      <Tabs defaultValue="import" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="import">Data Import</TabsTrigger>
          <TabsTrigger value="segmentation">Donor Segmentation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="import">
          <div className="grid gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Import Donor Data</h2>
              <ImportForm />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="segmentation">
          <div className="grid gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Donor Segmentation</h2>
              <SegmentationTool />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}