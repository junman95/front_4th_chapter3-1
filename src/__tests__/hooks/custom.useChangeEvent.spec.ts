import { act, renderHook } from '@testing-library/react';

import { useChangeEvent } from '../../hooks/useChangeEvent';
import { Event, EventForm } from '../../types';

const toast = vi.fn();
vi.mock('@chakra-ui/react', () => ({
  useToast: () => toast,
}));

describe('useChangeEvent', () => {
  it('추가할 때 타이틀이 없으면 에러 토스트가 발동된다.', () => {
    const mockEvent: EventForm = {
      title: '',
      date: '2025-02-05',
      startTime: '10:00',
      endTime: '11:00',
      description: '설명',
      location: '장소',
      category: '카테고리',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };
    const { result } = renderHook(() =>
      useChangeEvent({
        events: [],
        event: mockEvent,
        editingEvent: null,
        isRepeating: false,
        setOverlappingEvents: vi.fn(),
        setIsOverlapDialogOpen: vi.fn(),
        saveEvent: vi.fn(),
        resetForm: vi.fn(),
        errors: {
          startTimeError: null,
          endTimeError: null,
        },
      })
    );

    act(() => {
      result.current.addOrUpdateEvent();
    });

    expect(toast).toHaveBeenCalledWith({
      title: '필수 정보를 모두 입력해주세요.',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });

  it('겹치는 이벤트를 추가하면 overlapDialog 상태를 true로 변경한다.', () => {
    const mockEvent: EventForm = {
      title: '추가할 이벤트',
      date: '2025-02-05',
      startTime: '10:00',
      endTime: '11:00',
      description: '설명',
      location: '장소',
      category: '카테고리',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const prevEvents: Event[] = [
      {
        id: '1',
        title: '기존 이벤트',
        date: '2025-02-05',
        startTime: '10:00',
        endTime: '11:00',
        description: '설명',
        location: '장소',
        category: '카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    const mockSetOverlappingEvents = vi.fn();
    const mockSetOverlapDialogOpen = vi.fn();
    const { result } = renderHook(() =>
      useChangeEvent({
        events: [...prevEvents],
        event: mockEvent,
        editingEvent: null,
        isRepeating: false,
        setOverlappingEvents: mockSetOverlappingEvents,
        setIsOverlapDialogOpen: mockSetOverlapDialogOpen,
        saveEvent: vi.fn(),
        resetForm: vi.fn(),
        errors: {
          startTimeError: null,
          endTimeError: null,
        },
      })
    );

    act(() => {
      result.current.addOrUpdateEvent();
    });

    expect(mockSetOverlapDialogOpen).toHaveBeenCalledWith(true);
    expect(mockSetOverlappingEvents).toHaveBeenCalledWith(prevEvents);
  });
});
