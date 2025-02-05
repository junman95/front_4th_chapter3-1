import { http, HttpResponse } from 'msw';

import { server } from '../setupTests';
import { Event } from '../types';
import { events } from './response/events.json' assert { type: 'json' };

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.

export const setupMockHandlerFetching = (once: boolean = true) => {
  server.use(
    http.get('/api/events', () => HttpResponse.json({ events: [...events] as Event[] }), { once })
  );
};

export const setupMockHandlerFetchingError = (once: boolean = true) => {
  server.use(http.get('/api/events', () => HttpResponse.error(), { once }));
};
export const setupMockHandlerCreation = (initEvents = [...events] as Event[]) => {
  server.use(
    http.post('/api/events', async ({ request }) => {
      const newEventForm = (await request.json()) as Event;
      const newEvent: Event = { ...newEventForm, id: String(initEvents.length + 1) };
      initEvents.push(newEvent);
      return HttpResponse.json({ events: [...initEvents] as Event[] });
    })
  );
};

export const setupMockHandlerUpdating = () => {};

export const setupMockHandlerDeletion = () => {};

export const setupMockHandlerDeletionError = (once: boolean = true) => {
  server.use(http.delete('/api/events/:id', () => HttpResponse.error(), { once }));
};
