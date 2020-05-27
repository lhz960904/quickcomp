import React from 'react';
import Button from '../src';

const Basic = () => {
  const handleClick = () => {
    console.log('button emit');
  };

  return <Button onClick={handleClick}>123</Button>;
};

Basic.story = {
  name: '基本使用',
};

export default Basic;
