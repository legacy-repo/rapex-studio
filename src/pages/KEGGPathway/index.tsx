import { getPathways } from '@/services/swagger/OmicsData';
import type { ActionType, ProColumns, RequestData } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Row } from 'antd';
import type { SortOrder } from 'antd/es/table/interface';
import map from 'lodash.map';
import React, { useRef } from 'react';
import { FormattedMessage } from 'umi';
import './index.less';

type DataType = {
  key: string;
  ensembl_id: string;
  entrez_id: string;
  gene_symbol: string;
  pathway_id: string;
  pathway_name: string;
};

type PageParams = {
  current?: number | undefined;
  pageSize?: number | undefined;
};

function formatResponse(response: RequestData<DataType>): Promise<Partial<RequestData<DataType>>> {
  return Promise.resolve({
    ...response,
    success: true,
    data: map(response.data, (item: any) => {
      return { key: `${item.pathway_id}_${item.ensembl_id}`, ...item };
    }),
  });
}

function makeQueryStr(
  params: PageParams & DataType,
  sort: Record<string, SortOrder>,
  filter: Record<string, React.ReactText[] | null>,
): string {
  console.log('makeQueryStr filter: ', filter);
  const query_str = ':select [:*] :from [:kegg_pathway]';
  let sort_clause = '';
  let query_clause = '';
  if (sort) {
    const key = Object.keys(sort)[0];
    const value = Object.values(sort)[0];
    if (key && value) {
      if (value === 'ascend') {
        sort_clause = `:order-by [:${key}]`;
      } else {
        sort_clause = `:order-by [[:${key} :desc]]`;
      }
    }
  }

  if (params) {
    const subclauses = [];
    for (const key of Object.keys(params)) {
      if (['current', 'pageSize'].indexOf(key) < 0 && params[key].length > 0) {
        subclauses.push(`[:like :${key} "%${params[key]}%"]`);
      }
    }

    if (subclauses.length == 1) {
      query_clause = `:where ${subclauses[0]}`;
    } else if (subclauses.length > 1) {
      query_clause = `:where [:and ${subclauses.join(' ')}]`;
    }
  }

  return `{${query_str} ${sort_clause} ${query_clause}}`;
}

const requestPathways = async (
  params: PageParams & DataType,
  sort: Record<string, SortOrder>,
  filter: Record<string, React.ReactText[] | null>,
) => {
  console.log('requestPathways: ', params, sort, filter);
  const query_str = makeQueryStr(params, sort, filter);
  return await getPathways({
    page: params.current,
    page_size: params.pageSize,
    query_str: query_str,
  })
    .then((response) => {
      return formatResponse(response);
    })
    .catch((error) => {
      console.log('requestPathways Error: ', error);
      return formatResponse({ total: 0, success: true, data: [] });
    });
};

const KEGGPathway: React.FC = () => {
  // const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  // const [currentRow, setCurrentRow] = useState<DataType>();
  // const [selectedRowsState, setSelectedRows] = useState<DataType[]>([]);

  const columns: ProColumns<DataType>[] = [
    {
      title: <FormattedMessage id="pages.KEGGPathway.pathwayId" defaultMessage="Pathway ID" />,
      dataIndex: 'pathway_id',
      sorter: true,
      tip: 'Each pathway map is identified by the combination of 2-4 letter prefix code and 5 digit number.',
      render: (dom, entity) => {
        return (
          <a
            href={`https://www.kegg.jp/entry/${entity.pathway_id}`}
            rel="noreferrer"
            target="_blank"
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: <FormattedMessage id="pages.KEGGPathway.pathwayName" defaultMessage="Pathway Name" />,
      align: 'center',
      sorter: true,
      dataIndex: 'pathway_name',
      tip: 'The name of a KEGG pathway.',
    },
    {
      title: <FormattedMessage id="pages.KEGGPathway.geneSymbol" defaultMessage="Gene Symbol" />,
      align: 'center',
      dataIndex: 'gene_symbol',
      sorter: true,
      tip: 'A gene symbol is a short-form abbreviation for a particular gene.',
      // render: (dom, entity) => {
      //     return (
      //         <a
      //             onClick={() => {
      //                 // setCurrentRow(entity);
      //                 // setShowDetail(true);
      //             }}
      //         >
      //             {dom}
      //         </a>
      //     );
      // },
    },
    {
      title: <FormattedMessage id="pages.KEGGPathway.ensemblId" defaultMessage="Ensembl ID" />,
      dataIndex: 'ensembl_id',
      sorter: true,
      tip: 'Ensembl gene IDs begin with ENS for Ensembl, and then a G for gene.',
      // render: (dom, entity) => {
      //     return (
      //         <a
      //             onClick={() => {
      //                 // setCurrentRow(entity);
      //                 // setShowDetail(true);
      //             }}
      //         >
      //             {dom}
      //         </a>
      //     );
      // },
    },
    {
      title: <FormattedMessage id="pages.KEGGPathway.entrezId" defaultMessage="Entrez ID" />,
      align: 'center',
      sorter: true,
      dataIndex: 'entrez_id',
      tip: 'Entrez Gene provides unique integer identifiers for genes and other loci.',
      // render: (dom, entity) => {
      //     return (
      //         <a
      //             onClick={() => {
      //                 // setCurrentRow(entity);
      //                 // setShowDetail(true);
      //             }}
      //         >
      //             {dom}
      //         </a>
      //     );
      // },
    },
  ];

  return (
    <Row className="keggpathway">
      <ProTable<DataType, PageParams & DataType>
        className="keggpathway__table"
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
        }}
        pagination={{
          showQuickJumper: true,
          position: ['topLeft'],
        }}
        request={requestPathways}
        columns={columns}
        rowSelection={
          {
            // onChange: (_, selectedRows) => {
            //     setSelectedRows(selectedRows);
            // },
          }
        }
      />
    </Row>
  );
};

export default KEGGPathway;
