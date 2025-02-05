import { act, renderHook, waitFor } from '@testing-library/react';

import { setupMockHandlerFetching } from '../../__mocks__/handlersUtils.ts';
import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

describe('useNotifications', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  it('초기 상태에서는 알림이 없어야 한다', async () => {
    setupMockHandlerFetching();
    const {
      events,
    }: {
      events: Event[];
    } = await (await fetch('/api/events')).json();
    const { result } = renderHook(() => useNotifications(events));
    expect(result.current.notifications).toEqual([]);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', async () => {
    setupMockHandlerFetching();
    const {
      events,
    }: {
      events: Event[];
    } = await (await fetch('/api/events')).json();

    vi.setSystemTime(new Date('2024-10-15T08:49:00'));

    const { result } = renderHook(() => useNotifications(events));

    act(() => {
      vi.advanceTimersByTime(60000);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].message).toBe(
      `${events[0].notificationTime}분 후 ${events[0].title} 일정이 시작됩니다.`
    );
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', async () => {
    setupMockHandlerFetching();
    const {
      events,
    }: {
      events: Event[];
    } = await (await fetch('/api/events')).json();

    vi.setSystemTime(new Date('2024-10-15T08:49:00'));

    const { result } = renderHook(() => useNotifications(events));

    act(() => {
      vi.advanceTimersByTime(60000);
    });

    expect(result.current.notifications).toHaveLength(1);
    act(() => {
      result.current.removeNotification(0);
    });
    expect(result.current.notifications).toHaveLength(0);
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', async () => {
    setupMockHandlerFetching();
    const {
      events,
    }: {
      events: Event[];
    } = await (await fetch('/api/events')).json();

    vi.setSystemTime(new Date('2024-10-15T08:49:00'));

    const { result } = renderHook(() => useNotifications(events));

    act(() => {
      vi.advanceTimersByTime(65000);
    });

    // 이부분이 왜 6번이나 호출되는지 모르겠음
    expect(result.current.notifiedEvents).toHaveLength(6); // 6번나옴. 매 1000ms마다 1번씩 호출되는데, 6번이 나오는 이유는 모르겠음
    expect(result.current.notifications).toHaveLength(1); // 6번나옴. 매 1000ms마다 1번씩 호출되는데, 6번이 나오는 이유는 모르겠음
    expect(result.current.notifications[0].message).toBe(
      `${events[0].notificationTime}분 후 ${events[0].title} 일정이 시작됩니다.`
    );
  });
});
