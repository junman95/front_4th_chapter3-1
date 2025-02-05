import { act, renderHook } from '@testing-library/react';

import { setupMockHandlerFetching } from '../../__mocks__/handlersUtils.ts';
import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
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

    vi.setSystemTime(new Date('2024-10-15T08:49:59'));

    const { result } = renderHook(() => useNotifications(events));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Q. 이부분이 왜 6번이나 호출되는지 모르겠음
    // A. advanceTimersByTime이 매초 지났다고 판정할떄마다 훅의 useInterval이 호출되나,
    //    filter 로직이 act가 종료되기 전까지는 상태가 업데이트 되지 않아서 6번이 호출된다.
    //    act 사용시마다 렌더되면서 상태가 업데이트 되는 점을 유의해서 테스트 코드를 작성해야한다.
    expect(result.current.notifiedEvents).toHaveLength(1);
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].message).toBe(
      `${events[0].notificationTime}분 후 ${events[0].title} 일정이 시작됩니다.`
    );

    // 1초가 더 지나도 filter에서 걸려서 1개만 그대로 남아있음
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.notifiedEvents).toHaveLength(1);
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].message).toBe(
      `${events[0].notificationTime}분 후 ${events[0].title} 일정이 시작됩니다.`
    );

    // 1초가 더 지나도 filter에서 걸려서 1개만 그대로 남아있음
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.notifiedEvents).toHaveLength(1);
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].message).toBe(
      `${events[0].notificationTime}분 후 ${events[0].title} 일정이 시작됩니다.`
    );
  });
});
