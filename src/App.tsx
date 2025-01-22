import React, { useState, useEffect } from 'react';
import { EventCard } from './components/EventCard';
import { BookingModal } from './components/BookingModal';
import { AuthModal } from './components/AuthModal';
import { Navbar } from './components/Navbar';
import { EventCarousel } from './components/EventCarousel';
import { Event } from './types';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from './lib/supabase';
import { useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 9;

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, [currentPage]);

  async function fetchEvents() {
    try {
      setIsLoading(true);
      // First, get the total count
      const { count } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      setTotalCount(count || 0);

      // Then fetch the paginated data
      const { data, error } = await supabase
        .from('events')
        .select(`
          id,
          title,
          description,
          date,
          time,
          location,
          image_url,
          price,
          capacity
        `)
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1)
        .order('date', { ascending: true });

      if (error) throw error;

      const transformedEvents: Event[] = (data || []).map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date: new Date(event.date).toLocaleDateString(),
        time: event.time,
        location: event.location,
        imageUrl: event.image_url,
        price: event.price,
        capacity: event.capacity,
        registeredCount: 0
      }));

      setEvents(transformedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  }

  const selectedEvent = events.find(event => event.id === selectedEventId);

  const handleBookEvent = (eventId: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setSelectedEventId(eventId);
    setIsModalOpen(true);
  };

  const handleBookingSubmit = async (formData: { name: string; email: string; preferences: string }) => {
    if (!user || !selectedEventId) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .insert([
          {
            event_id: selectedEventId,
            user_id: user.id,
            preferences: formData.preferences,
            status: 'pending'
          }
        ]);

      if (error) throw error;
      return Promise.resolve();
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast.error('Failed to submit booking');
      return Promise.reject(error);
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Get the latest 5 events for the carousel
  const latestEvents = [...events]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <Navbar onOpenAuth={() => setIsAuthModalOpen(true)} />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <EventCarousel events={latestEvents} />
        </div>

        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Filter className="w-5 h-5" />
              <span>Filter</span>
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onBook={handleBookEvent}
                  />
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-8 flex justify-center items-center space-x-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </main>
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleBookingSubmit}
        selectedEvent={selectedEvent}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default App;