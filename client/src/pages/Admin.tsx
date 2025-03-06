import ImportForm from "@/components/admin/ImportForm";

export default function Admin() {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-500">
          Import and manage donor data
        </p>
      </div>
      
      <div className="grid gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Import Donor Data</h2>
          <ImportForm />
        </div>
      </div>
    </div>
  );
}