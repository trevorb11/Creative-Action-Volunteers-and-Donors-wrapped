import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Check, AlertCircle, Download, RefreshCw, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SegmentationOptions {
  donationMin?: number;
  donationMax?: number;
  donationFrequency?: string;
  dateRange?: string;
  includeNoEmail?: boolean;
}

interface DonorSegment {
  id: string;
  name: string;
  criteria: string[];
  count: number;
}

export default function SegmentationTool() {
  const [options, setOptions] = useState<SegmentationOptions>({
    donationMin: undefined,
    donationMax: undefined,
    donationFrequency: undefined,
    dateRange: 'all',
    includeNoEmail: false
  });
  
  const [segments, setSegments] = useState<DonorSegment[]>([
    { 
      id: 'high-value', 
      name: 'High Value Donors', 
      criteria: ['Donation > $500', 'Last 12 months'], 
      count: 128 
    },
    { 
      id: 'frequent', 
      name: 'Frequent Donors', 
      criteria: ['3+ donations', 'Last 12 months'], 
      count: 215 
    },
    { 
      id: 'recent', 
      name: 'Recent First-time Donors', 
      criteria: ['First donation', 'Last 3 months'], 
      count: 76 
    }
  ]);
  
  const [activeSegment, setActiveSegment] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const handleCreateSegment = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Make API call to create a segment based on the criteria
      const response = await fetch('/api/segmentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...options,
          name: `Donation $${options.donationMin || 0} - $${options.donationMax || '∞'}`
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create segment');
      }
      
      const segmentResult = await response.json();
      
      // Create segment from API result
      const newSegment: DonorSegment = {
        id: segmentResult.id,
        name: segmentResult.name,
        criteria: [
          options.donationMin ? `Donation > $${options.donationMin}` : '',
          options.donationMax ? `Donation < $${options.donationMax}` : '',
          options.dateRange === 'lastYear' ? 'Last 12 months' : '',
          options.dateRange === 'lastQuarter' ? 'Last 3 months' : '',
          options.donationFrequency === 'single' ? 'One-time donors' : '',
          options.donationFrequency === 'multiple' ? 'Repeat donors' : '',
        ].filter(Boolean),
        count: segmentResult.donorCount
      };
      
      setSegments([...segments, newSegment]);
      setSuccess(`Segment created successfully with ${newSegment.count} donors`);
      
      // Reset form
      setOptions({
        donationMin: undefined,
        donationMax: undefined,
        donationFrequency: undefined,
        dateRange: 'all',
        includeNoEmail: false
      });
    } catch (err) {
      console.error('Error creating segment:', err);
      setError('Failed to create segment: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExportSegment = async (segmentId: string) => {
    // This would make an API call to export the segment
    alert(`Exporting segment ${segmentId}`);
  };
  
  const handleDeleteSegment = async (segmentId: string) => {
    // This would make an API call to delete the segment
    setSegments(segments.filter(segment => segment.id !== segmentId));
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Donor Segmentation</CardTitle>
        <CardDescription>
          Create targeted donor segments based on donation history and other criteria
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="create">
          <TabsList className="mb-4">
            <TabsTrigger value="create">Create Segment</TabsTrigger>
            <TabsTrigger value="manage">Manage Segments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="donationMin">Minimum Donation</Label>
                  <div className="flex items-center">
                    <span className="mr-2">$</span>
                    <Input 
                      id="donationMin" 
                      type="number" 
                      placeholder="Min amount"
                      value={options.donationMin || ''}
                      onChange={(e) => setOptions({...options, donationMin: Number(e.target.value) || undefined})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="donationMax">Maximum Donation</Label>
                  <div className="flex items-center">
                    <span className="mr-2">$</span>
                    <Input 
                      id="donationMax" 
                      type="number" 
                      placeholder="Max amount"
                      value={options.donationMax || ''}
                      onChange={(e) => setOptions({...options, donationMax: Number(e.target.value) || undefined})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="donationFrequency">Donation Frequency</Label>
                  <Select 
                    value={options.donationFrequency}
                    onValueChange={(value) => setOptions({...options, donationFrequency: value})}
                  >
                    <SelectTrigger id="donationFrequency">
                      <SelectValue placeholder="All donors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">One-time donors</SelectItem>
                      <SelectItem value="multiple">Repeat donors</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateRange">Date Range</Label>
                  <Select 
                    value={options.dateRange}
                    onValueChange={(value) => setOptions({...options, dateRange: value})}
                  >
                    <SelectTrigger id="dateRange">
                      <SelectValue placeholder="All time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All time</SelectItem>
                      <SelectItem value="lastYear">Last 12 months</SelectItem>
                      <SelectItem value="lastQuarter">Last 3 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox 
                  id="includeNoEmail" 
                  checked={options.includeNoEmail}
                  onCheckedChange={(checked) => setOptions({...options, includeNoEmail: !!checked})}
                />
                <Label htmlFor="includeNoEmail">Include donors without email addresses</Label>
              </div>
              
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert variant="default" className="mt-4">
                  <Check className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="manage">
            <div className="space-y-4">
              {segments.length === 0 ? (
                <div className="text-center p-8 text-gray-500">No segments created yet</div>
              ) : (
                segments.map((segment) => (
                  <div 
                    key={segment.id} 
                    className="border rounded-lg p-4 transition hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{segment.name}</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {segment.criteria.map((criterion, i) => (
                            <Badge key={i} variant="outline">{criterion}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge>{segment.count} donors</Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleExportSegment(segment.id)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setOptions({
          donationMin: undefined,
          donationMax: undefined,
          donationFrequency: undefined,
          dateRange: 'all',
          includeNoEmail: false
        })}>
          Reset
        </Button>
        <Button onClick={handleCreateSegment} disabled={isLoading}>
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Create Segment
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}