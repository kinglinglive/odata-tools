# odata-tools
Anything to odata query.

## 使用示例

### AntdProTable
``` js
import { antdProTableToODataQueryString } from 'odata-tools';
// ProTable的request中使用
 request={async (params, sort, filter) => {
          const msg = await getUserOdata(
            antdProTableToODataQueryString(
              columns,
              params,
              sort,
              filter,
              'expand=roles(select=id,name,key)&orderby=creationTime desc',
            ),
          );
          return {
            data: msg.value,
            success: true,
            total: msg['@odata.count'],
          };
        }}
      />
// 已实现的column valueType处理：
const processingFunctions: Record<string, ProcessingFunction> = {
  text: (key, value) => `contains(${key},'${value}')`,
  select: (key, value) => `${key} eq ${value}`,
  date: (key, value) => `${key} eq ${value}`,
  dateRange: (key, value) => `${key} ge ${value[0]} and ${key} le ${value[1]}`,
};
// 自定义某个column的查询，例如：
    {
      title: '组织类型',
      dataIndex: 'orgType',
      search: true,
      valueEnum: {
        AA: { text: 'AAText' },
        BB: { text: 'BBText' },
        CC: { text: 'CCText' },
      },
      odataFilter: (key, value) => `${key} eq '${value}'`,
    },
```