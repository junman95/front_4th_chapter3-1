import { act, renderHook } from '@testing-library/react';

import { eachFilterEvents, events as mockEvents } from '../../__mocks__/data/events.ts';
import { useSearch } from '../../hooks/useSearch.ts';

describe('useSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-10-01T00:00:00Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(mockEvents, new Date(), 'month'));
    act(() => {
      result.current.setSearchTerm('');
    });
    expect(result.current.searchTerm).toBe('');
    expect(result.current.filteredEvents).toEqual(
      mockEvents.filter((event) => event.date.includes('2024-10'))
    );
  });

  it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
    const { result } = renderHook(() => useSearch(mockEvents, new Date(), 'month'));
    console.log(result.current.filteredEvents);
    act(() => {
      result.current.setSearchTerm('이벤트');
    });

    expect(result.current.searchTerm).toBe('이벤트');
    // 10월중 '이벤트'라는 단어가 포함된 이벤트만 필터링되어야 한다.
    expect(result.current.filteredEvents).toEqual(
      mockEvents
        .filter((event) => event.date.includes('2024-10'))
        .filter(
          (event) =>
            event.title.includes('이벤트') ||
            event.description.includes('이벤트') ||
            event.location.includes('이벤트')
        )
    );
  });

  it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(eachFilterEvents, new Date(), 'month'));
    console.log(result.current.filteredEvents);
    act(() => {
      result.current.setSearchTerm('타이틀');
    });

    expect(result.current.searchTerm).toBe('타이틀');
    // 10월중 '타이틀'라는 단어가 포함된 이벤트만 필터링되어야 한다.
    expect(result.current.filteredEvents).toEqual([eachFilterEvents[0]]);

    act(() => {
      result.current.setSearchTerm('설명');
    });

    expect(result.current.searchTerm).toBe('설명');
    // 10월중 '설명'라는 단어가 포함된 이벤트만 필터링되어야 한다.
    expect(result.current.filteredEvents).toEqual([eachFilterEvents[1]]);

    act(() => {
      result.current.setSearchTerm('장소');
    });

    expect(result.current.searchTerm).toBe('장소');
    // 10월중 '장소'라는 단어가 포함된 이벤트만 필터링되어야 한다.
    expect(result.current.filteredEvents).toEqual([eachFilterEvents[2]]);
  });

  it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(mockEvents, new Date(), 'month'));
    expect(result.current.filteredEvents).toEqual(
      mockEvents.filter((event) => event.date.includes('2024-10'))
    );

    const { result: result2 } = renderHook(() => useSearch(mockEvents, new Date(), 'week'));
    expect(result2.current.filteredEvents.length).toBe(1);
    expect(result2.current.filteredEvents).toEqual([mockEvents[0]]);
  });

  it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
    const { result } = renderHook(() => useSearch(eachFilterEvents, new Date(), 'month'));
    act(() => {
      result.current.setSearchTerm('회의');
    });

    expect(result.current.searchTerm).toBe('회의');
    expect(result.current.filteredEvents).toEqual([eachFilterEvents[0], eachFilterEvents[2]]);

    act(() => {
      result.current.setSearchTerm('점심');
    });

    expect(result.current.searchTerm).toBe('점심');
    expect(result.current.filteredEvents).toEqual([eachFilterEvents[1]]);
  });
});
