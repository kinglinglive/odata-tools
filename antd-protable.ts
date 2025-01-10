
type ProcessingFunction = (key: string, value: any) => string;

// 实现具体的处理函数
const processingFunctions: Record<string, ProcessingFunction> = {
  text: (key, value) => `contains(${key},'${value}')`,
  select: (key, value) => `${key} eq ${value}`,
  date: (key, value) => `${key} eq ${value}`,
  digit: (key, value) => `${key} eq ${value}`,
  dateRange: (key, value) => `${key} ge ${value[0]} and ${key} le ${value[1]}`,
};

// 处理筛选对象，把数组key处理为单key，例如['english', 'name'] => 'english/name'
function getNestedKeysWithValues(obj: any, prefix: string = ''): { key: string, value: any }[] {
  let result: { key: string, value: any }[] = [];

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}/${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        // 如果值是对象，则递归
        result = result.concat(getNestedKeysWithValues(obj[key], newKey));
      } else {
        // 否则直接把键和值添加到结果中
        result.push({ key: newKey, value: obj[key] });
      }
    }
  }

  return result;
}

export function antdProTableToODataQueryString(
  columns: any,
  params: any,
  filter: any,
  sort: any,
  defaultQuery: string = ''
) {

  const odataQueryObj: any = {}

  // 分页
  odataQueryObj.count = true
  odataQueryObj.top = params.pageSize
  odataQueryObj.skip = (params.current - 1) * params.pageSize

  // 排序
  const entries = Object.entries(sort);
  for (const [key, value] of entries) {
    odataQueryObj.orderby = (`${key.replace(/,/g, '/')} ${value === 'descend' ? 'desc' : 'asc'}`);
  }

  // 搜索
  if (params.keyword) {
    odataQueryObj.search = `"${params.keyword}"`
  }

  // 过滤
  // 删除params中的pagesize和current属性
  delete params.pageSize
  delete params.current

  delete params.keyword

  // 合并params和filter，filter优先级高
  const filterObjAll: Record<any, any> = { ...params, ...filter }

  const filterObj = getNestedKeysWithValues(filterObjAll)
  const filterArr: string[] = []

  for (let { key, value } of filterObj) {
    // 匹配columns中的dataIndex，获取到对应的column
    const currentColumn = columns.find((item: any) => Array.isArray(item.dataIndex) ? item.dataIndex.join('/') === key : item.dataIndex === key)
    if (!currentColumn) {
      console.log('currentColumn not found', key)
      continue
    }
    // 是否有针对该column的filterMethod
    if (currentColumn.odataFilter) {
      filterArr.push(currentColumn.odataFilter(key, value))
      continue;
    }
    // 获取到column的valueType
    const valueType = currentColumn.valueType ?? 'text'
    // 获取到column的filterMethod
    const filterMethod = processingFunctions[valueType]
    // 如果filterMethod存在，调用filterMethod
    if (filterMethod) {
      filterArr.push(filterMethod(key, value))
    }
    else {
      filterArr.push(processingFunctions.text(key, value))
    }
  }
  if (filterArr.length > 0)
    odataQueryObj.filter = filterArr.join(' and ')

  // 处理默认的查询
  const queryObj = new URLSearchParams(odataQueryObj);

  if (!defaultQuery) return '?' + queryObj.toString();

  const defaultQueryObj = new URLSearchParams(defaultQuery)

  // orderby不存在，使用默认orderby
  if (!odataQueryObj.orderby && defaultQueryObj.get('orderby')) {
    queryObj.append('orderby', `${defaultQueryObj.get('orderby')}`)
  }

  // 存在默认filter
  if (defaultQueryObj.get('filter')) {
    if (odataQueryObj.filter) {
      queryObj.set('filter', `${defaultQueryObj.get('filter')} and ${odataQueryObj.filter}`)
    }
    else {
      queryObj.append('filter', defaultQueryObj.get('filter')!)  
    }
  }

  // 存在extend，拼接extend
  if (defaultQueryObj.get('expand')) {
    queryObj.append('expand', defaultQueryObj.get('expand')!)
  }

  // 存在select，拼接select
  if (defaultQueryObj.get('select')) {
    queryObj.append('select', defaultQueryObj.get('select')!)
  }

  const queryString = queryObj.toString();
  return '?' + queryString
}
