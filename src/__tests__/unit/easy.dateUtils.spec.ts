import { Event } from '../../types';
import {
  fillZero,
  formatDate,
  formatMonth,
  formatWeek,
  getDaysInMonth,
  getEventsForDay,
  getWeekDates,
  getWeeksAtMonth,
  isDateInRange,
} from '../../utils/dateUtils';

const LEAP_YEARS = [2024, 1988, 2400];
const ONE_DAY = 24 * 60 * 60 * 1000;
enum 요일 {
  '일',
  '월',
  '화',
  '수',
  '목',
  '금',
  '토',
}

describe('getDaysInMonth', () => {
  it('1월은 31일 수를 반환한다', () => {
    expect(getDaysInMonth(2024, 1)).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    expect(getDaysInMonth(2024, 4)).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    LEAP_YEARS.forEach((ly) => {
      expect(getDaysInMonth(ly, 2)).toBe(29);
    });
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    const normalYears = [2023, 1990, 2300];
    normalYears.forEach((ny) => {
      expect(getDaysInMonth(ny, 2)).toBe(28);
    });
  });

  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    // error throw에 대한 에러를 확인하려면 함수식으로 넣어야한다.

    expect(() => getDaysInMonth(2025, 15)).toThrowError('Wrong Month'); //over
    expect(() => getDaysInMonth(2025, 0)).toThrowError('Wrong Month'); //below
    expect(() => getDaysInMonth(2025, -10)).toThrowError('Wrong Month'); //below 0
  });
});

describe('getWeekDates', () => {
  let today = new Date();
  beforeEach(() => {
    // 가짜 타이머 활성화
    vi.useFakeTimers();

    // 특정 시간으로 시스템 시간 고정
    vi.setSystemTime(new Date('2025-02-01T12:28:32.440Z'));
    today = new Date();
  });

  afterEach(() => {
    // 원래 타이머로 복구
    vi.useRealTimers();
    today = new Date();
  });

  // !Q1. 현재 시간값을 기준으로 테스트하는것이 좋을까요?
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const diff = today.getDay() - 요일.수;
    // 이번주의 수요일 구하는 공식
    console.log(today);
    const wednesday = new Date(today.setDate(today.getDate() - diff));

    const expected = [
      new Date(wednesday.getTime() - ONE_DAY * 3), // 일요일
      new Date(wednesday.getTime() - ONE_DAY * 2), // 월요일
      new Date(wednesday.getTime() - ONE_DAY), // 화요일
      wednesday, // 수요일
      new Date(wednesday.getTime() + ONE_DAY), // 목요일
      new Date(wednesday.getTime() + ONE_DAY * 2), // 금요일
      new Date(wednesday.getTime() + ONE_DAY * 3), // 토요일
    ];

    // Reference 비교가 들어가는 것은 toEqual을 사용한다.
    expect(getWeekDates(new Date(wednesday))).toEqual(expected);
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const diff = today.getDay() - 요일.월;
    // 이번주의 월요일 구하는 공식
    const monday = new Date(new Date().setDate(today.getDate() - diff));
    const expected = [
      new Date(monday.getTime() - ONE_DAY), // 일요일
      monday,
      new Date(monday.getTime() + ONE_DAY),
      new Date(monday.getTime() + ONE_DAY * 2),
      new Date(monday.getTime() + ONE_DAY * 3),
      new Date(monday.getTime() + ONE_DAY * 4),
      new Date(monday.getTime() + ONE_DAY * 5),
    ];

    expect(getWeekDates(new Date(monday))).toEqual(expected);
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const diff = today.getDay() - 요일.일;
    // 이번주의 일요일 구하는 공식
    const sunday = new Date(new Date().setDate(today.getDate() - diff));
    const expected = [
      sunday,
      new Date(sunday.getTime() + ONE_DAY),
      new Date(sunday.getTime() + ONE_DAY * 2),
      new Date(sunday.getTime() + ONE_DAY * 3),
      new Date(sunday.getTime() + ONE_DAY * 4),
      new Date(sunday.getTime() + ONE_DAY * 5),
      new Date(sunday.getTime() + ONE_DAY * 6),
    ];

    expect(getWeekDates(new Date(sunday))).toEqual(expected);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const lastDay = new Date('2024-12-31'); // 화요일
    const expected = [
      new Date(lastDay.getTime() - ONE_DAY * 2), // 일요일
      new Date(lastDay.getTime() - ONE_DAY), // 월요일
      lastDay, // 화요일
      new Date(lastDay.getTime() + ONE_DAY), // 수요일
      new Date(lastDay.getTime() + ONE_DAY * 2), // 목요일
      new Date(lastDay.getTime() + ONE_DAY * 3), // 금요일
      new Date(lastDay.getTime() + ONE_DAY * 4), // 토요일
    ];

    expect(getWeekDates(new Date(lastDay))).toEqual(expected);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const firstDay = new Date('2025-01-01'); // 수요일
    const expected = [
      new Date(firstDay.getTime() - ONE_DAY * 3), // 일요일
      new Date(firstDay.getTime() - ONE_DAY * 2), // 월요일
      new Date(firstDay.getTime() - ONE_DAY), // 화요일
      firstDay, // 수요일
      new Date(firstDay.getTime() + ONE_DAY), // 목요일
      new Date(firstDay.getTime() + ONE_DAY * 2), // 금요일
      new Date(firstDay.getTime() + ONE_DAY * 3), // 토요일
    ];

    expect(getWeekDates(new Date(firstDay))).toEqual(expected);
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const leapYearLastDay = new Date('2024-02-29'); // 목요일
    const expected = [
      new Date(leapYearLastDay.getTime() - ONE_DAY * 4), // 일요일
      new Date(leapYearLastDay.getTime() - ONE_DAY * 3), // 월요일
      new Date(leapYearLastDay.getTime() - ONE_DAY * 2), // 화요일
      new Date(leapYearLastDay.getTime() - ONE_DAY), // 수요일
      leapYearLastDay, // 목요일
      new Date(leapYearLastDay.getTime() + ONE_DAY), // 금요일
      new Date(leapYearLastDay.getTime() + ONE_DAY * 2), // 토요일
    ];

    expect(getWeekDates(new Date(leapYearLastDay))).toEqual(expected);
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const lastDay = new Date('2024-07-31'); // 수요일
    const expected = [
      new Date(lastDay.getTime() - ONE_DAY * 3), // 일요일
      new Date(lastDay.getTime() - ONE_DAY * 2), // 월요일
      new Date(lastDay.getTime() - ONE_DAY), // 화요일
      lastDay, // 수요일
      new Date(lastDay.getTime() + ONE_DAY), // 목요일
      new Date(lastDay.getTime() + ONE_DAY * 2), // 금요일
      new Date(lastDay.getTime() + ONE_DAY * 3), // 토요일
    ];

    expect(getWeekDates(new Date(lastDay))).toEqual(expected);
  });
});

describe('getWeeksAtMonth', () => {
  it('2024년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const weeks = getWeeksAtMonth(new Date('2024-07-01'));
    expect(weeks).toHaveLength(5);

    // 1일은 월요일이므로 앞에 null이 들어가야 한다.
    expect(weeks[0]).toEqual([null, 1, 2, 3, 4, 5, 6]);
    // 마지막 주
    expect(weeks[weeks.length - 1]).toEqual([28, 29, 30, 31, null, null, null]);
  });
});

describe('getEventsForDay', () => {
  let mockEvents: Event[] = [];
  beforeEach(() => {
    mockEvents = [
      {
        id: '1',
        title: '기존 회의',
        date: '2024-10-1',
        startTime: '10:00',
        endTime: '11:00',
        description: '첫 날 회의',
        location: '대회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '신규 회의',
        date: '2024-10-17',
        startTime: '11:00',
        endTime: '12:00',
        description: '신규 팀 미팅 (1)',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '신규 회의',
        date: '2024-10-18',
        startTime: '12:00',
        endTime: '13:00',
        description: '신규 팀 미팅 (2)',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '4',
        title: '신규 회의',
        date: '2024-10-19',
        startTime: '13:00',
        endTime: '14:00',
        description: '신규 팀 미팅 (3)',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '5',
        title: '신규 회의',
        date: '2024-10-20',
        startTime: '14:00',
        endTime: '15:00',
        description: '신규 팀 미팅 (4)',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '6',
        title: '신규 회의',
        date: '2024-10-21',
        startTime: '15:00',
        endTime: '16:00',
        description: '신규 팀 미팅 (5)',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '7',
        title: '신규 회의',
        date: '2024-10-22',
        startTime: '16:00',
        endTime: '17:00',
        description: '신규 팀 미팅 (6)',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '8',
        title: '신규 회의',
        date: '2024-10-23',
        startTime: '17:00',
        endTime: '18:00',
        description: '신규 팀 미팅 (7)',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '9',
        title: '신규 회의',
        date: '2024-10-24',
        startTime: '18:00',
        endTime: '19:00',
        description: '신규 팀 미팅 (8)',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
  });
  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const events = getEventsForDay(mockEvents, new Date('2024-10-01').getDate());
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      id: '1',
      title: '기존 회의',
      date: '2024-10-1',
      startTime: '10:00',
      endTime: '11:00',
      description: '첫 날 회의',
      location: '대회의실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    });
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const events = getEventsForDay(mockEvents, new Date('2024-10-02').getDate());
    expect(events).toHaveLength(0);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const events = getEventsForDay(mockEvents, 0);
    expect(events).toHaveLength(0);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const events = getEventsForDay(mockEvents, 32);
    expect(events).toHaveLength(0);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const middleDate = new Date('2025-01-16');
    const formatted = formatWeek(middleDate);
    expect(formatted).toBe('2025년 1월 3주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const firstDate = new Date('2025-01-01');
    const formatted = formatWeek(firstDate);
    expect(formatted).toBe('2025년 1월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const lastDate = new Date('2025-01-31');
    const formatted = formatWeek(lastDate);
    expect(formatted).toBe('2025년 1월 5주');

    // 25년 2월은 4주차 까지만 있다
    const lastDate2 = new Date('2025-02-28');
    const formatted2 = formatWeek(lastDate2);
    expect(formatted2).toBe('2025년 2월 4주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const lastDate = new Date('2024-12-31');
    const formatted = formatWeek(lastDate);
    expect(formatted).toBe('2025년 1월 1주');

    const firstDate = new Date('2025-01-01');
    const formatted2 = formatWeek(firstDate);
    expect(formatted2).toBe('2025년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const leapDates = LEAP_YEARS.map((year) => new Date(`${year}-02-29`));
    const formatted = leapDates.map((date) => formatWeek(date));
    expect(formatted).toEqual(['2024년 2월 5주', '1988년 3월 1주', '2400년 3월 1주']);
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const normalDates = [2023, 1990, 2300].map((year) => new Date(`${year}-02-28`));
    const formatted = normalDates.map((date) => formatWeek(date));
    expect(formatted).toEqual(['2023년 3월 1주', '1990년 3월 1주', '2300년 3월 1주']);
  });
});

describe('formatMonth', () => {
  it("2024년 7월 10일을 '2024년 7월'로 반환한다", () => {
    const date = new Date('2024-07-10');
    const formatted = formatMonth(date);
    expect(formatted).toBe('2024년 7월');
  });
});

describe('isDateInRange', () => {
  const rangeStart = new Date('2024-07-01');
  const rangeEnd = new Date('2024-07-31');

  it('범위 내의 날짜 2024-07-10에 대해 true를 반환한다', () => {
    const date = new Date('2024-07-10');
    expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(true);
  });

  it('범위의 시작일 2024-07-01에 대해 true를 반환한다', () => {
    const date = new Date('2024-07-01');
    expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(true);
  });

  it('범위의 종료일 2024-07-31에 대해 true를 반환한다', () => {
    const date = new Date('2024-07-31');
    expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(true);
  });

  it('범위 이전의 날짜 2024-06-30에 대해 false를 반환한다', () => {
    const date = new Date('2024-06-30');
    expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(false);
  });

  it('범위 이후의 날짜 2024-08-01에 대해 false를 반환한다', () => {
    const date = new Date('2024-08-01');
    expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const date = new Date('2024-07-10');
    expect(isDateInRange(date, rangeEnd, rangeStart)).toBe(false);
  });
});

describe('fillZero', () => {
  test("5를 2자리로 변환하면 '05'를 반환한다", () => {
    expect(fillZero(5, 2)).toBe('05');
  });

  test("10을 2자리로 변환하면 '10'을 반환한다", () => {
    expect(fillZero(10, 2)).toBe('10');
  });

  test("3을 3자리로 변환하면 '003'을 반환한다", () => {
    expect(fillZero(3, 3)).toBe('003');
  });

  test("100을 2자리로 변환하면 '100'을 반환한다", () => {
    expect(fillZero(100, 2)).toBe('100');
  });

  test("0을 2자리로 변환하면 '00'을 반환한다", () => {
    expect(fillZero(0, 2)).toBe('00');
  });

  test("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    expect(fillZero(1, 5)).toBe('00001');
  });

  test("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
    expect(fillZero(3.14, 5)).toBe('03.14');
  });

  test('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    expect(fillZero(5)).toBe('05');
  });

  test('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    expect(fillZero(123, 2)).toBe('123');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const date = new Date('2025-2-10');
    expect(formatDate(date)).toBe('2025-02-10');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const date = new Date('2025-2-10');
    expect(formatDate(date, 15)).toBe('2025-02-15');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date('2025-2-10');
    expect(formatDate(date)).toBe('2025-02-10');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date('2025-2-5');
    expect(formatDate(date)).toBe('2025-02-05');
  });
});
