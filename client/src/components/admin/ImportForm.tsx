import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle, Check, Loader2, Upload } from 'lucide-react';

interface ImportResult {
  total: number;
  successful: number;
  failed: number;
  errors: string[];
}

export default function ImportForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/import/excel', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload file');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Import Donor Data</CardTitle>
        <CardDescription>
          Upload an Excel file containing donor information and donation history.
          The file should have columns for email, first_name, last_name, phone, etc.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="file" className="text-sm font-medium leading-none">
                Excel File
              </label>
              <input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept=".xlsx,.xls"
                className="border border-gray-300 rounded-md p-2"
              />
            </div>
          </div>

          <div className="flex justify-between mt-4">
            <Button type="button" variant="outline" onClick={() => setFile(null)} disabled={isUploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={!file || isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload and Process
                </>
              )}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert variant={result.failed > 0 ? 'destructive' : 'default'} className="mt-4">
              <Check className="h-4 w-4" />
              <AlertTitle>Import Results</AlertTitle>
              <AlertDescription>
                <p>Total records: {result.total}</p>
                <p>Successfully imported: {result.successful}</p>
                {result.failed > 0 && (
                  <>
                    <p>Failed: {result.failed}</p>
                    {result.errors.length > 0 && (
                      <details>
                        <summary>View errors</summary>
                        <ul className="text-xs mt-2">
                          {result.errors.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
}