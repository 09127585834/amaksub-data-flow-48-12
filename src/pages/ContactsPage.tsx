import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  phoneNumbers: { number: string }[];
}

const ContactsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const returnPath = location.state?.returnPath || '/dashboard';

  useEffect(() => {
    // Get contacts from location state or fetch them
    const contactsFromState = location.state?.contacts || [];
    setContacts(contactsFromState);

    // If no contacts in state, try to fetch them directly
    if (contactsFromState.length === 0 && (window as any).median) {
      (window as any).median.contacts.getAll((fetchedContacts: any) => {
        setContacts(fetchedContacts || []);
      });
    }
  }, [location.state]);

  const handleContactSelect = (contact: Contact) => {
    const phoneNumber = contact.phoneNumbers[0]?.number || '';
    
    // Navigate back to airtime page with selected phone number
    navigate(returnPath, { 
      state: { 
        selectedPhoneNumber: phoneNumber.replace(/\D/g, '') // Remove non-digits
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center p-4 bg-background border-b">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/airtime/beneficiary', { state: { returnPath } })}
          className="h-10 w-10 mr-4 no-focus-active"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">Select Contact</h1>
      </header>

      <div className="p-4">
        {contacts.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-center text-muted-foreground">
              No contacts available or permission not granted.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => handleContactSelect(contact)}
                className="flex items-center space-x-3 p-4 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {contact.name}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {contact.phoneNumbers[0]?.number || 'No phone number'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsPage;