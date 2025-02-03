import { fetchHolidays } from '../../apis/fetchHolidays';

describe('fetchHolidays', () => {
  it('주어진 월의 공휴일만 반환한다', () => {
    const holidays = fetchHolidays(new Date('2024-01-01'));
    expect(Object.keys(holidays).length).toBe(1);
    expect(holidays).toEqual({
      '2024-01-01': '신정',
    });
    const holidays2 = fetchHolidays(new Date('2024-03-01'));
    expect(Object.keys(holidays2).length).toBe(1);
    expect(holidays2).toEqual({
      '2024-03-01': '삼일절',
    });
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    const holidays = fetchHolidays(new Date('2024-07-01'));
    expect(Object.keys(holidays).length).toBe(0);
    expect(holidays).toEqual({});
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {
    const holidays = fetchHolidays(new Date('2024-02-01'));
    expect(Object.keys(holidays).length).toBe(3);
    expect(holidays).toEqual({
      '2024-02-09': '설날',
      '2024-02-10': '설날',
      '2024-02-11': '설날',
    });
    const holidays2 = fetchHolidays(new Date('2024-09-01'));
    expect(Object.keys(holidays2).length).toBe(3);
    expect(holidays2).toEqual({
      '2024-09-16': '추석',
      '2024-09-17': '추석',
      '2024-09-18': '추석',
    });
  });
});
