import { Card } from 'antd';
import React from 'react';
import GeneList from './GeneList';
import './Welcome.less';

const Welcome: React.FC = () => {
  return (
    <Card className="welcome">
      <GeneList></GeneList>
    </Card>
  );
};

export default Welcome;
