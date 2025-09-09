import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';

const ExamPage = () => {
  const navigate = useNavigate();
  const [selectedExam, setSelectedExam] = useState<{
    name: string;
    price: number;
    image: string;
  } | null>(null);
  const [quantity, setQuantity] = useState('');

  const examTypes = [
    {
      name: 'WAEC',
      price: 3400,
      image: '/lovable-uploads/fc9dca02-e9dd-4346-9c98-a24462bfbcc3.png'
    },
    {
      name: 'NECO',
      price: 1500,
      image: '/lovable-uploads/652741f3-e74b-4de3-9668-163c0600a8f4.png'
    },
    {
      name: 'NABTEB',
      price: 1200,
      image: '/lovable-uploads/8ad1ee27-b2ad-4f9f-a77e-1fe971f4ab39.png'
    }
  ];

  const handleExamSelect = (exam: typeof examTypes[0]) => {
    setSelectedExam(exam);
  };

  const handlePurchase = () => {
    if (!selectedExam || !quantity || parseInt(quantity) < 1) return;

    navigate('/exam/review', {
      state: {
        selectedExam,
        quantity: parseInt(quantity),
        totalAmount: selectedExam.price * parseInt(quantity)
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-background">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/dashboard')}
          className="h-10 w-10 no-focus-active"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <h1 className="text-lg font-semibold text-foreground">Exam</h1>
        
        <Button 
          variant="ghost" 
          onClick={() => navigate('/exam/history')}
          className="text-primary hover:text-primary/80 no-focus-active"
        >
          History
        </Button>
      </header>

      <div className="p-4">
        {/* Exam Types Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {examTypes.map((exam) => (
            <div
              key={exam.name}
              className={`cursor-pointer transition-all duration-200 ${
                selectedExam?.name === exam.name
                  ? 'ring-2 ring-primary'
                  : ''
              }`}
              onClick={() => handleExamSelect(exam)}
            >
              <img
                src={exam.image}
                alt={exam.name}
                className="w-full h-20 object-contain"
              />
            </div>
          ))}
        </div>

        {/* Quantity Input */}
        <div className="mb-6">
          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Quantity"
            className="h-14 text-base focus-visible:ring-0 focus-visible:ring-offset-0 border-input"
          />
        </div>

        {/* Purchase Button */}
        <div className="flex justify-center">
          <Button
            onClick={handlePurchase}
            disabled={!selectedExam || !quantity || parseInt(quantity) < 1}
            className="h-14 text-lg font-semibold px-12"
            size="lg"
          >
            Purchase
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;