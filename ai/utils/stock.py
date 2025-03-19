import yfinance as yf
import akshare as ak
from typing import Dict, Any
import pandas as pd

def get_stock_info(symbol: str, market: str) -> Dict[str, Any]:
    """
    获取股票市场信息
    
    Args:
        symbol: 股票代码
        market: 市场类型 (US/HK/CN)
        
    Returns:
        Dict[str, Any]: 股票信息字典
    """
    try:
        if market in ["US", "HK"]:
            # 使用 yfinance 获取美股和港股数据
            if market == "HK" and not symbol.endswith(".HK"):
                symbol = f"{symbol}.HK"
            
            stock = yf.Ticker(symbol)
            info = stock.info
            price = stock.history(period="1d")
            
            return {
                "success": True,
                "data": {
                    "symbol": symbol,
                    "name": info.get("longName", ""),
                    "price": price["Close"].iloc[-1],
                    "change": price["Close"].iloc[-1] - price["Open"].iloc[0],
                    "change_percent": ((price["Close"].iloc[-1] - price["Open"].iloc[0]) / price["Open"].iloc[0] * 100),
                    "volume": price["Volume"].iloc[-1],
                    "market_cap": info.get("marketCap", 0),
                    "pe_ratio": info.get("trailingPE", 0),
                }
            }
            
        elif market == "CN":
            # 使用 akshare 获取 A 股数据
            stock_zh_a_spot_df = ak.stock_zh_a_spot()
            stock_info = stock_zh_a_spot_df[stock_zh_a_spot_df["代码"] == symbol.replace("sh", "").replace("sz", "")]
            
            if not stock_info.empty:
                return {
                    "success": True,
                    "data": {
                        "symbol": symbol,
                        "name": stock_info["名称"].iloc[0],
                        "price": float(stock_info["最新价"].iloc[0]),
                        "change": float(stock_info["涨跌额"].iloc[0]),
                        "change_percent": float(stock_info["涨跌幅"].iloc[0]),
                        "volume": float(stock_info["成交量"].iloc[0]),
                        "market_cap": float(stock_info["总市值"].iloc[0]),
                        "pe_ratio": float(stock_info["市盈率-动态"].iloc[0]),
                    }
                }
            
        return {
            "success": False,
            "error": "未找到股票信息"
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"获取股票信息失败: {str(e)}"
        } 