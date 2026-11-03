import { describe, expect, it, jest } from '@jest/globals';
import {
  act,
  configure,
  fireEvent,
  render,
  screen,
} from '@testing-library/react-native';
import { CodeInput, PinPad } from '../index';

// The real text input is hidden from assistive tech on purpose; tests still need to reach it.
configure({ defaultIncludeHiddenElements: true });

describe('CodeInput', () => {
  it('fills cells, reports changes, and completes once', () => {
    const onChange = jest.fn();
    const onComplete = jest.fn();
    render(
      <CodeInput
        length={4}
        onChange={onChange}
        onComplete={onComplete}
        testID="code"
      />
    );
    const input = screen.getByTestId('code-input');
    fireEvent.changeText(input, '12');
    expect(onChange).toHaveBeenLastCalledWith('12');
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    fireEvent.changeText(input, '1234');
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith('1234');
    fireEvent.changeText(input, '1234');
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('strips non-digits and caps the length', () => {
    const onChange = jest.fn();
    render(<CodeInput length={4} onChange={onChange} testID="code" />);
    fireEvent.changeText(screen.getByTestId('code-input'), '1a2b3c4d5');
    expect(onChange).toHaveBeenLastCalledWith('1234');
  });

  it('masked mode shows dots instead of digits', () => {
    render(<CodeInput length={4} value="12" masked testID="code" />);
    expect(screen.queryByText('1')).toBeNull();
    expect(screen.getByLabelText(/2 of 4 digits/)).toBeTruthy();
  });
});

describe('PinPad', () => {
  it('collects digits and submits on the last one', async () => {
    const onComplete = jest.fn(() => true);
    render(<PinPad length={4} onComplete={onComplete} />);
    for (const key of ['2', '4', '6', '8']) {
      fireEvent.press(screen.getByLabelText(key));
    }
    await act(async () => {});
    expect(onComplete).toHaveBeenCalledWith('2468');
  });

  it('delete removes the last digit', () => {
    const onComplete = jest.fn(() => true);
    render(<PinPad length={2} onComplete={onComplete} />);
    fireEvent.press(screen.getByLabelText('1'));
    fireEvent.press(screen.getByLabelText('Delete'));
    fireEvent.press(screen.getByLabelText('3'));
    fireEvent.press(screen.getByLabelText('5'));
    expect(onComplete).toHaveBeenCalledWith('35');
  });
});
