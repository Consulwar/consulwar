/**
 * React 19 Popup System - Migration from Blaze
 * Maintains the same external API and supports multiple template types:
 * React components, BlazeComponents, and native Blaze templates
 */

import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Blaze } from 'meteor/blaze';
import { Template } from 'meteor/templating';
import Game from '/moduls/game/lib/main.game';
import '/imports/client/ui/button/button.styl';

const BlazeWrapper = ({ template, data }) => {
  const ref = useRef();
  const viewRef = useRef();

  useEffect(() => {
    if (ref.current && template) {
      viewRef.current = Blaze.renderWithData(template, data || {}, ref.current);
    }
    return () => viewRef.current && Blaze.remove(viewRef.current);
  }, [template, data]);

  return <div ref={ref} />;
};

const Popup = ({ zIndex, hideClose, isMain, children, onClose }) => {
  const ref = useRef();

  useEffect(() => ref.current?.focus(), []);

  const handleKeyUp = (e) => {
    if (e.keyCode === 9) ref.current?.focus();
    if (e.keyCode === 27) onClose();
  };

  return (
    <div ref={ref} className="popup" style={{ zIndex }} tabIndex="-1" onKeyUp={handleKeyUp}>
      <div className="cw--popup__wrapper">
        {!hideClose && (
          <button
            className={`cw--popup__close ${isMain ? 'cw--PageIndex__closeButton' : 'cw--button cw--button_close'}`}
            data-sound="hover,close"
            onClick={onClose}
          />
        )}
        {children}
      </div>
    </div>
  );
};

initPopupClient = function() {
  let zIndex = 100;
  const activePopups = new Map();
  let counter = 0;

  const renderContent = (template, templateName, data) => {
    if (template?.renderComponent) return template.renderComponent();
    if (React.isValidElement(template)) return template;
    if (typeof template === 'function') return React.createElement(template, data);
    if (template) return <BlazeWrapper template={template} data={data} />;
    if (templateName && Template[templateName]) return <BlazeWrapper template={Template[templateName]} data={data} />;
    return <div>No template provided</div>;
  };

  Game.Popup = {
    get zIndex() { return zIndex; },

    show({ templateName, data, template = templateName ? Template[templateName] : null, hideClose = false, isMain }) {
      const container = document.querySelector('.over');
      if (!container) return console.error('Popup container .over not found');

      const popupDiv = document.createElement('div');
      container.appendChild(popupDiv);
      const root = createRoot(popupDiv);
      const id = ++counter;

      const close = () => {
        zIndex--;
        root.unmount();
        popupDiv.remove();
        activePopups.delete(id);
        document.querySelector('.popup:last-child')?.focus();
      };

      activePopups.set(id, close);
      zIndex++;

      root.render(
        <Popup zIndex={zIndex} hideClose={hideClose} isMain={isMain} onClose={close}>
          {renderContent(template, templateName, data)}
        </Popup>
      );

      return { close, popupId: id };
    },

    closeAll() {
      activePopups.forEach(close => close());
    }
  };
};
