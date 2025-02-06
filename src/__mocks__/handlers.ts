import { http, HttpResponse } from 'msw';

import { Event, EventForm } from '../types';
import { events } from './response/events.json' assert { type: 'json' };

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json<{ events: Event[] }>({ events } as { events: Event[] });
  }),

  http.post('/api/events', async ({ request }) => {
    const newEventForm = (await request.json()) as EventForm;
    const newEvent: Event = { ...newEventForm, id: String(events.length + 1) };
    events.push(newEvent);
    return HttpResponse.json({ events });
  }),

  http.put('/api/events/:id', async ({ request }) => {
    const updatedEvent = (await request.json()) as Event;
    const index = events.findIndex((event) => event.id === updatedEvent.id);
    events[index] = updatedEvent;
    if (index === -1) {
      return HttpResponse.error();
    }
    return HttpResponse.json({ events } as { events: Event[] });
  }),
];
