import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';

import EventList from '../../components/EventList';
import { Event } from '../../types';

describe('EventList', () => {
  it('이벤트 목록이 렌더링된다.', async () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트1',
        date: '2025-02-05',
        startTime: '10:00',
        endTime: '11:00',
        description: '설명',
        location: '장소',
        category: '카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '이벤트2',
        date: '2025-02-05',
        startTime: '11:00',
        endTime: '12:00',
        description: '설명',
        location: '장소',
        category: '카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
    const notifiedEvents: string[] = ['1'];

    await render(
      <ChakraProvider>
        <EventList
          filteredEvents={events}
          deleteEvent={vi.fn()}
          editEvent={vi.fn()}
          notificationOptions={[]}
          notifiedEvents={notifiedEvents}
          searchTerm={''}
          setSearchTerm={vi.fn()}
        />
      </ChakraProvider>
    );

    expect(screen.getByText('이벤트1')).toBeInTheDocument();
    expect(screen.getByText('이벤트2')).toBeInTheDocument();
  });

  it('검색어를 입력하면 setSearchTerm으로 값을 넘겨준다', async () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트1',
        date: '2025-02-05',
        startTime: '10:00',
        endTime: '11:00',
        description: '설명',
        location: '장소',
        category: '카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '이벤트2',
        date: '2025-02-05',
        startTime: '11:00',
        endTime: '12:00',
        description: '설명',
        location: '장소',
        category: '카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
    const notifiedEvents: string[] = ['1'];

    const mockSetSearchTerm = vi.fn();

    await render(
      <ChakraProvider>
        <EventList
          filteredEvents={events}
          deleteEvent={vi.fn()}
          editEvent={vi.fn()}
          notificationOptions={[]}
          notifiedEvents={notifiedEvents}
          searchTerm={''}
          setSearchTerm={mockSetSearchTerm}
        />
      </ChakraProvider>
    );
    const user = userEvent.setup();

    const searchInput = screen.getByLabelText('일정 검색');
    await act(async () => {
      await user.click(searchInput);
      await user.paste('이벤트1');
    });

    expect(mockSetSearchTerm).toHaveBeenCalledWith('이벤트1');
  });

  it('검색어를 입력하면 setSearchTerm으로 값을 넘겨준다(fireEvent 버전)', async () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트1',
        date: '2025-02-05',
        startTime: '10:00',
        endTime: '11:00',
        description: '설명',
        location: '장소',
        category: '카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '이벤트2',
        date: '2025-02-05',
        startTime: '11:00',
        endTime: '12:00',
        description: '설명',
        location: '장소',
        category: '카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
    const notifiedEvents: string[] = ['1'];

    const mockSetSearchTerm = vi.fn();

    await render(
      <ChakraProvider>
        <EventList
          filteredEvents={events}
          deleteEvent={vi.fn()}
          editEvent={vi.fn()}
          notificationOptions={[]}
          notifiedEvents={notifiedEvents}
          searchTerm={''}
          setSearchTerm={mockSetSearchTerm}
        />
      </ChakraProvider>
    );
    userEvent.setup();

    const searchInput = screen.getByLabelText('일정 검색');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: '이벤트1' } });
    });

    expect(mockSetSearchTerm).toHaveBeenCalledWith('이벤트1');
  });
});
