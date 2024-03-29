// Must use `import *` or named imports for React's types

import React, {FunctionComponent} from 'react';
import * as stripeJs from '../js/types/stripe-js/index.d.ts';


// import PropTypes from 'prop-types';

import {useElementsContextWithUseCase} from './Elements.tsx';
import {useCallbackReference} from '../utils/useCallbackReference.ts';
import {ElementProps} from '../../../Stripe/src/types/index.ts';
import {usePrevious} from '../utils/usePrevious.ts';
import {
  extractAllowedOptionsUpdates,
  UnknownOptions,
} from '../utils/extractAllowedOptionsUpdates.ts';

type UnknownCallback = (...args: unknown[]) => any;

interface PrivateElementProps {
  id?: string;
  className?: string;
  onChange?: UnknownCallback;
  onBlur?: UnknownCallback;
  onFocus?: UnknownCallback;
  onEscape?: UnknownCallback;
  onReady?: UnknownCallback;
  onClick?: UnknownCallback;
  options?: UnknownOptions;
}

const noop = () => {};

const capitalized = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const createElementComponent = (
  type: stripeJs.StripeElementType,
  isServer: boolean
): FunctionComponent<ElementProps> => {
  const displayName = `${capitalized(type)}Element`;

  const ClientElement: FunctionComponent<PrivateElementProps> = ({
    id,
    className,
    options = {},
    onBlur = noop,
    onFocus = noop,
    onReady = noop,
    onChange = noop,
    onEscape = noop,
    onClick = noop,
  }) => {
    const {elements} = useElementsContextWithUseCase(`mounts <${displayName}>`);
    const elementRef = React.useRef<stripeJs.StripeElement | null>(null);
    const domNode = React.useRef<HTMLDivElement | null>(null);

    const callOnReady = useCallbackReference(onReady);
    const callOnBlur = useCallbackReference(onBlur);
    const callOnFocus = useCallbackReference(onFocus);
    const callOnClick = useCallbackReference(onClick);
    const callOnChange = useCallbackReference(onChange);
    const callOnEscape = useCallbackReference(onEscape);

    React.useLayoutEffect(() => {
      if (elementRef.current == null && elements && domNode.current != null) {
        const element = elements.create(type as any, options);
        elementRef.current = element;
        element.mount(domNode.current);
        element.on('ready', () => callOnReady(element));
        element.on('change', callOnChange);
        element.on('blur', callOnBlur);
        element.on('focus', callOnFocus);
        element.on('escape', callOnEscape);

        // Users can pass an an onClick prop on any Element component
        // just as they could listen for the `click` event on any Element,
        // but only the PaymentRequestButton will actually trigger the event.
        (element as any).on('click', callOnClick);
      }
    });

    const prevOptions = usePrevious(options);
    React.useEffect(() => {
      if (!elementRef.current) {
        return;
      }

      const updates = extractAllowedOptionsUpdates(options, prevOptions, [
        'paymentRequest',
      ]);

      if (updates) {
        elementRef.current.update(updates);
      }
    }, [options, prevOptions]);

    React.useLayoutEffect(() => {
      return () => {
        if (elementRef.current) {
          elementRef.current.destroy();
        }
      };
    }, []);

    return <div id={id} className={className} ref={domNode} />;
  };

  // Only render the Element wrapper in a server environment.
  const ServerElement: FunctionComponent<PrivateElementProps> = (props) => {
    // Validate that we are in the right context by calling useElementsContextWithUseCase.
    useElementsContextWithUseCase(`mounts <${displayName}>`);
    const {id, className} = props;
    return <div id={id} className={className} />;
  };

  const Element = isServer ? ServerElement : ClientElement;

  // Element.propTypes = {
  //   id: PropTypes.string,
  //   className: PropTypes.string,
  //   onChange: PropTypes.func,
  //   onBlur: PropTypes.func,
  //   onFocus: PropTypes.func,
  //   onReady: PropTypes.func,
  //   onClick: PropTypes.func,
  //   options: PropTypes.object as any,
  // };

  interface Element {
    id: string,
    className: string,
    onChange: Function,
    onBlur: Function,
    onFocus: Function,
    onReady: Function,
    onClick: Function,
    options: object

  }

  Element.displayName = displayName;
  (Element as any).__elementType = type;

  return Element as FunctionComponent<ElementProps>;
};

export default createElementComponent;