import React, { useEffect, useState } from 'react';
import GridContainer from '../../../../@jumbo/components/GridContainer';
import PageContainer from '../../../../@jumbo/components/PageComponents/layouts/PageContainer';
import Grid from '@material-ui/core/Grid';
import { Box, Card, CardContent, FormControl, InputLabel, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableRow, TextField, Typography } from '@material-ui/core';
import CmtCard from '@coremat/CmtCard';
import CmtCardHeader from '@coremat/CmtCard/CmtCardHeader';
import CmtCardContent from '@coremat/CmtCard/CmtCardContent';
import { useStickyState } from '@jumbo/utils/commonHelper';

const breadcrumbs = [
  { label:'Calculators', link: '/calculators' },
  { label: 'Stats' }
];

const classes = [ 'Cleric', 'Dragon', 'Fighter', 'Monk', 'Mage', 'Rogue' ];

const races = [ 'Artrell', 'Centaur', 'Dwarf', 'Elf', 'Faerie', 'Giant', 'Gnoll',
  'Gnome', 'Goblin', 'Half-elf', 'Half-ogre', 'Half-orc', 'Halfling', 'Hobbit', 'Human',
  'Imp', 'Kender', 'Kobold', 'Nymph', 'Ogre', 'Ogre-magi', 'Orc', 'Satyr', 'Troll',
  'Dragon', 'Drow-elf', 'Lich', 'Were-wolf' ];

const stats = ['Strength', 'Charisma', 'Constitution', 'Dexterity', 'Intelligence', 'Wisdom'];

const raceStats = {
  Strength : {
    1 : [ 'Satyr', 'Troll', 'Dragon', 'Giant', 'Were-wolf' ],
    2 : [ 'Centaur', 'Dwarf', 'Orc', 'Half-ogre', 'Ogre', 'Goblin', 'Ogre-magi', 'Drow-elf', 'Gnoll', 'Kobold' ],
    4 : [ 'Nymph', 'Faerie', 'Imp' ],
  },
  Charisma : {
    1 : [ 'Dragon', 'Nymph', 'Human' ],
    2 : [ 'Half-elf', 'Hobbit', 'Faerie' ],
    4 : [ 'Satyr', 'Centaur', 'Gnome', 'Troll', 'Ogre', 'Drow-elf', 'Artrell', 'Ogre-magi', 'Giant' ],
  },
  Constitution : {
    1 : [ 'Dragon', 'Ogre', 'Centaur', 'Kender' ],
    2 : [ 'Ogre-magi', 'Orc', 'Half-orc', 'Kobold', 'Gnoll', 'Giant', 'Troll' ],
    4 : [ 'Faerie', 'Halfling', 'Nymph', 'Imp' ],
  },
  Dexterity : {
    1 : [ 'Artrell', 'Dragon', 'Halfling', 'Hobbit' ],
    2 : [ 'Half-elf', 'Nymph', 'Satyr', 'Kender', 'Faerie', 'Goblin', 'Kobold', 'Half-orc', 'Drow-elf', 'Were-wolf', 'Imp', 'Centaur' ],
    4 : [ 'Ogre-magi' ],
  },
  Intelligence : {
    1 : [ 'Dragon', 'Lich', 'Imp', 'Elf', 'Gnome' ],
    2 : [ 'Imp', 'Faerie', 'Ogre-magi', 'Drow-elf', 'Half-ogre', 'Halfling', 'Kender' ],
    4 : [ 'Hobbit', 'Centaur' ],
  },
  Wisdom : {
    1 : [ 'Dragon', 'Lich', 'Dwarf', 'Nymph', 'Imp' ],
    2 : [ 'Gnome', 'Elf', 'Faerie', 'Ogre-magi', 'Halfling', 'Human', 'Drow-elf', 'Giant', 'Artrell' ],
    4 : [ 'Kender', 'Centaur' ],
  },
};
const levelModifiers = Array.from({ length: 140 }, (value, i) => i + 1);

const BASE_FACTOR = 0.525;
const CLASS = {
  1: 0.0,
  2: 0.425,
  3: 0.7,
  4: 2.5,
};
const RACE = {
  1: 0.0,
  2: 0.325,
  3: 0.8,
  4: 2.0,
  5: 3.0,
};

// ------------------------------------------------------------

function getAdvanceExp(level) {
  let result = level * level * level * 80;
  if (level < 20) result = result * level / 20;
  return result + 5350;
}

function getMaxExp(level) {
  return getAdvanceExp(level) + getAdvanceExp(level + 1) + getAdvanceExp(level + 2);
}

// ------------------------------------------------------------

function getClassModifier(charClass, stat) {
  let result = CLASS[4];
  if (charClass === 'Dragon') {
    result = CLASS[3];
  } else if (charClass === 'Cleric') {
    switch(stat) {
      case 'Charisma': case 'Intelligence':
        result = CLASS[1]; break;
      case 'Strength': case 'Wisdom':
        result = CLASS[2]; break;
    }
  } else if (charClass === 'Fighter') {
    switch(stat) {
      case 'Strength': case 'Constitution':
        result = CLASS[1]; break;
      case 'Dexterity':
        result = CLASS[2]; break;
    }
  } else if (charClass === 'Mage') {
    switch(stat) {
      case 'Intelligence': case 'Wisdom':
        result = CLASS[1]; break;
      case 'Charisma':
        result = CLASS[2]; break;
    }
  } else if (charClass === 'Monk') {
    switch(stat) {
      case 'Strength': case 'Constitution': case 'Dexterity':
      case 'Intelligence': case 'Wisdom':
        result = CLASS[2]; break;
    }
  } else if (charClass === 'Rogue') {
    switch(stat) {
      case 'Charisma': case 'Dexterity':
        result = CLASS[1]; break;
      case 'Strength':
        result = CLASS[2]; break;
      case 'Constitution':
        result = CLASS[3]; break;
    }
  }      
  return result;
}

function getRaceModifier(race, stat) {
  let rank = RACE[5];
  if (!raceStats[stat]) {
    rank = 3;
  } else {
    const tiers = raceStats[stat];
    Object.keys(raceStats[stat]).forEach((tier) => {
      if (raceStats[stat][tier].indexOf(race) > -1) {
        rank = +tier;
      }
    });
  }
  let result = 0.0;
  if (RACE[rank]) {
    result = RACE[rank];
  }
  return result;
}
function getBaseCost(level) {
  let result = 0;
  for (let i = level; i > 0; i -= 15) {
    switch (i) {
      case 0: case 1: case 2: case 3: case 4:
        result += 1;
        break;
      case 5: case 6:
        result += 2;
        break;
      case 7: case 8:
        result+=5;
        break;
      case 9:
        result+=9;
        break;
      case 10:
        result+=14;
        break;
      default:
        result += (i*i*(100+i*5) + i*1000/3)/1000;
        break;
    }
  }

  if (result < 9) {
    return result;
  } else {
    return Math.trunc(result * BASE_FACTOR);
  }
}

function getStatCost(stat, charClass, race, statLevel=1, count=1) {
  statLevel = parseInt(statLevel);
  count = parseInt(count);
  if (count <= 0) {
    return 0;
  } else if (count > 500) {
    count = 500;
  }

  let cost = 0;
  const classModifier = getClassModifier(charClass, stat);
  const raceModifier = getRaceModifier(race, stat);
  cost = Math.trunc(getBaseCost(statLevel) * (1.0 + classModifier + raceModifier)) * 1000;
  
  /* // @TODO need a Were-wolf toggle
    if((this_player()->query_were_wolf() && (this_player()->query_race() != "were-wolf")))
      if((stat == "wisdom") || (stat == "intelligence") || (stat == "charisma"))
        cost *= 1.15;
  */

  return cost + getStatCost(stat, charClass, race, statLevel + 1, count - 1);
}

function getMaxStat(stat, charClass, race, level) {
  const maxEXP = getMaxExp(level);
  let statLvl = 0;

  while(statLvl < 500 && getStatCost(stat, charClass, race, statLvl, 1) <= maxEXP) {
    statLvl ++;
  }  
  return statLvl;
}

const StatCalculator = () => {
  const [charClass, setCharClass] = useStickyState('statCalc_charClass', classes[0]);
  const [race, setRace] = useStickyState('statCalc_race', races[0]);
  const [level, setLevel] = useStickyState('statCalc_level', 1);
  const [advExp, setAdvExp] = useState(0);
  const [maxExp, setMaxExp] = useState(0);
  const [statLevels, setStatLevels] = useStickyState('statCalc_statLevels', {});
  const [statInc, setStatInc] = useState({});

  const updateStatLevels = (k,v) => {
    setStatLevels(statLevels => ({
      ...statLevels,
      [k]: v
    }));
  };

  const updateStatInc = (k,v) => {
    setStatInc(statInc => ({
      ...statInc,
      [k]: v
    }));
  };

  useEffect(() => {
    setAdvExp(getAdvanceExp(level));
    setMaxExp(getMaxExp(level));
  }, [level]);

  return (
    <PageContainer breadcrumbs={breadcrumbs} heading='Stat Calculator'>
      <GridContainer>
        <Grid item xs={12}>
          <CmtCard>
            <CmtCardHeader title='Character Info'/>
            <CmtCardContent>
              <div>
                <Box pb={{ xs: 6, md: 10, xl: 16 }}>
                  <GridContainer>
                    <Grid item xs={12} sm={4}>
                      <FormControl style={{ width: '100%' }}>
                        <InputLabel>Class</InputLabel>
                        <Select
                          label='Class'
                          value={charClass}
                          onChange={event => setCharClass(event.target.value)}
                        >
                        {classes.map(item => (
                          <MenuItem key={item} value={item}>
                            {item}
                          </MenuItem>
                        ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControl style={{ width: '100%' }}>
                        <InputLabel>Race</InputLabel>
                        <Select
                          label='Race'
                          value={race}
                          onChange={event => setRace(event.target.value)}
                        >
                        {races.map(item => (
                          <MenuItem key={item} value={item}>
                            {item}
                          </MenuItem>
                        ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControl style={{ width: '100%' }} variant="outlined">
                        <TextField
                          label='Level'
                          type='number'
                          value={level}
                          onChange={event => setLevel(parseInt(event.target.value))}/>
                      </FormControl>
                    </Grid>
                  </GridContainer>
                </Box>
              </div>
            </CmtCardContent>
            <CmtCardHeader title='Level Information'/>
            <CmtCardContent>
              <div>
                <Box pb={{ xs: 6, md: 10, xl: 16 }}>
                  <TableContainer>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell>Stat Requirement</TableCell>
                          <TableCell>{Math.max(0, (level - 6) * 10)}</TableCell>
                          <TableCell>Skill Requirement</TableCell>
                          <TableCell>200</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Level Cost</TableCell>
                          <TableCell>{advExp.toLocaleString("en-US")}</TableCell>
                          <TableCell>Max Experience</TableCell>
                          <TableCell>{maxExp.toLocaleString("en-US")}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </div>
            </CmtCardContent>
            <CmtCardHeader title='Stat Information'/>
            <CmtCardContent>
              <div>
                <Box pb={{ xs: 6, md: 10, xl: 16 }}>
                  <TableContainer>
                    <Table style={{ maxWidth: '800px' }}>
                      <TableBody>
                      {stats.map(stat => (
                        <TableRow>
                        <TableCell>{stat}</TableCell>
                        <TableCell align='right'>
                          <TextField
                            style={{ width: '75px' }}
                            type='number'
                            value={statLevels[stat]}
                            variant='outlined'
                            onChange={event => updateStatLevels(stat, event.target.value)}
                            />
                        </TableCell>
                        <TableCell>/{getMaxStat(stat, charClass, race, level)}</TableCell>
                        <TableCell>Cost to improve:</TableCell>
                        <TableCell>
                          <TextField
                            style={{ width: '75px' }}
                            type='number'
                            defaultValue='1'
                            variant='outlined'
                            onChange={event => updateStatInc(stat, event.target.value)}/>
                        </TableCell>
                        <TableCell>{getStatCost(stat, charClass, race, statLevels[stat], statInc[stat]).toLocaleString("en-US")} exp</TableCell>
                      </TableRow>
                      ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </div>
            </CmtCardContent>
          </CmtCard>
        </Grid>
      </GridContainer>
    </PageContainer>
  );
};

export default StatCalculator;