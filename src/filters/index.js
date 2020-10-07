// 全局过滤器定义
// 数值加金额符号
exports.formatMoney = (value) => {
  if (value) {
    value = Number(value)
    return '￥ ' + value.toFixed(2)
  }
}
// 时间格式化 patter设置形参默认值
exports.dateFormat = (value, patter = '') => {
  var dt = new Date(value)
  var y = dt.getFullYear()
  var m = (dt.getMonth() + 1).toString().padStart(2, '0')
  var d = dt.getDate().toString().padStart(2, '0')
  if (patter.toLowerCase() === 'yyyy-mm-dd') {
    return `${y}-${m}-${d}`
  } else {
    var hh = dt.getHours().toString().padStart(2, '0')
    var mm = dt.getMinutes().toString().padStart(2, '0')
    var ss = dt.getSeconds().toString().padStart(2, '0')
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
  }
}
// 类型指定名称
exports.statusName = (val) => {
  let statusName = ''
  switch (val) {
    case 0: {
      statusName = '已取消'
      break
    }
    case 10: {
      statusName = '未付款'
      break
    }
    case 20: {
      statusName = '已付款'
      break
    }
  }
  return statusName
}
