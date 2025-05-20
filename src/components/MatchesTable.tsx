import { useCallback, useMemo } from 'react';
import { AutoSizer, Column, defaultTableCellRenderer, defaultTableHeaderRenderer, Table, type TableCellDataGetter, type TableCellRenderer } from 'react-virtualized';

import { defaultCellDataGetter } from 'react-virtualized/dist/es/Table';
import { useMatches } from '../hooks/useMatches';
import { dateTimeFormat } from '../helpers';

export const MatchesTable = () => {
  const matches = useMatches()

  const cellDataGetter = useCallback<TableCellDataGetter>((params) => {
    switch (params.dataKey) {
      case 'score': return `${params.rowData.scoreHome}-${params.rowData.scoreAway}`
      case 'startDateTime': return dateTimeFormat.format(new Date(params.rowData.startDateTime))
      default: return defaultCellDataGetter(params)
    }
  }, [])

  const cellRenderer = useCallback<TableCellRenderer>((props) => {
    switch (props.dataKey) {
      case 'sport': return <img src={new URL(`../assets/${props.rowData.sport}.svg`, import.meta.url).href} className="h-full" />
      default: return defaultTableCellRenderer(props)
    }
  }, [])

  const columnProps = useMemo(() => ({
    headerRenderer: defaultTableHeaderRenderer,
    cellDataGetter,
    cellRenderer,
    className: 'w-24',
  }), [cellDataGetter, cellRenderer])

  return <AutoSizer>
    {({ height, width }) => <Table
      columnWidth={100}
      height={height}
      width={width}
      rowCount={matches.length}
      rowHeight={30}
      headerHeight={35}
      headerClassName="w-24"
      rowClassName="flex"
      rowGetter={({ index }) => matches[index]}
    >
      <Column {...columnProps} width={200} label="Sport" dataKey="sport" />
      <Column {...columnProps} width={200} label="Start Date" dataKey="startDateTime" />
      <Column {...columnProps} width={100} label="Home Team" dataKey="teamHome" />
      <Column {...columnProps} width={100} label="Away Team" dataKey="teamAway" />
      <Column {...columnProps} width={50} label="1" dataKey="odd1" />
      <Column {...columnProps} width={50} label="x" dataKey="oddX" />
      <Column {...columnProps} width={50} label="2" dataKey="odd2" />
      <Column {...columnProps} width={50} label="1x" dataKey="odd1x" />
      <Column {...columnProps} width={50} label="2x" dataKey="odd2x" />
      <Column {...columnProps} width={50} label="score" dataKey="score" />
    </Table>}
  </AutoSizer>
}
