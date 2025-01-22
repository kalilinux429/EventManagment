import React from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Event } from '../types';

interface EventCardProps {
  event: Event;
  onBook: (eventId: string) => void;
}

export function EventCard({ event, onBook }: EventCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]">
      <img
        src={event.imageUrl}
        alt={event.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-5 h-5 mr-2" />
            <span>{event.date} at {event.time}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="w-5 h-5 mr-2" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Users className="w-5 h-5 mr-2" />
            <span>{event.registeredCount}/{event.capacity} registered</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">
            ${event.price.toFixed(2)}
          </span>
          <button
            onClick={() => onBook(event.id)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={event.registeredCount >= event.capacity}
          >
            {event.registeredCount >= event.capacity ? 'Sold Out' : 'Book Now'}
          </button>
        </div>
      </div>
    </div>
  );
}