import React, { useEffect, useRef } from 'react';

const HTMLOverlay = ({ children }) => {
  return <div className="html-overlay">{children}</div>;
};

const HTMLOverlayItem = ({ coordinates, children, viewState }) => {
  const ref = useRef();
  console.log("viewstate is here:",viewState);
  const deck = viewState.deck;
  const defaultViewport = deck.viewManager._viewportMap["default-view"];
  console.log("default viwport:",defaultViewport);

  useEffect(() => {
    const [longitude, latitude] = coordinates;
    console.log("coordinates:",coordinates);


    const [x, y] = defaultViewport.project([88.49175358524279, 22.571194159512256]);
    console.log("x and y :",x,y);

    if (ref.current) {
      ref.current.style.left = `${x}px`;
      ref.current.style.top = `${y}px`;
    }
  }, [coordinates, viewState]);

  return (
    <div ref={ref} className="html-overlay-item" style={{ position: 'absolute' }}>
      {children}
    </div>
  );
};

export { HTMLOverlay, HTMLOverlayItem };
