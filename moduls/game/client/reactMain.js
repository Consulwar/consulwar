
import React from 'react';
import { createRoot } from 'react-dom/client';

Meteor.startup(() => {
  const root = createRoot(document.getElementById('game'));
  root.render(<div></div>);
});
