
portal-web项目代码地址：  https://codehub-y.huawei.com/NGCRM/platform/portal-web/home

ib-web 项目代码地址：https://codehub-y.huawei.com/ngbilling/middlePlatform/ib-web/files?ref=master

登录桩:https://login.crm.huawei.com/

合并请求查询：https://lab.crm.huawei.com/mergetool/request.html

w3华为网址：https://w3.huawei.com/next/indexa.html

接口页面：http://swagger.crm.huawei.com/apiview/index.html

接口模拟桩：http://ngcrm-simulate.crm.huawei.com:5000/userLogin/Login    账号：lwx1521855  密码：@L13247897115

问题单网址：https://dts-szv.clouddragon.huawei.com/DTSPortal/workspace

UCD图网址：https://octo.hdesign.huawei.com/pipeline/workspace/team/files?teamId=74306&groupId=89559

需求单（GDE Mate）：https://gdemate.gts.huawei.com/portal/6baf55d703b441e799d139e3a00d5661/requirement/reqList

电签：https://aspjj.crm.huawei.com:684/portal-gateway/contract/contract/index.html?menuId=electronicSignOrderQuery

工具网址：https://lab.crm.huawei.com/

华为办公软件地址：https://his.huawei.com/eportal/#/?ns=rnd

组件ant pro ： https://docs.crm.huawei.com/?item=5

AI网址:  
https://asko3.o3community.huawei.com/asko3/searchFrame?lang=zh_CN&showChat=true&orgin=empty&catalogue=ALL&anchor=askEmcJQ54hFsPElF-1dZFMQ&sortMethod=RELEVANCE&rank=index
https://playground.llm.gts.huawei.com/

DBOX网址：https://dbox.huawei.com/detaildocs?oid=VR:wt.doc.WTDocument:101219298137

专线月租标签链接：http://10.74.244.115:8000/ib-web-zmy/DistributionManage/FeeSettlementChargeQry?token=7268E97B0D9BC0491BE15C7947C026DF&secretString=HWCRM&staffNo=ZJDS001&cityID=759&region=759

电签链接：https://aspjj.crm.huawei.com:684/portal-gateway/contract/contract/index.html?menuId=eSignOrderAndFacePhotoQuery

ib-web工程讲解：https://clouddrive.huawei.com/p/63a40d4dbbab24129bfb12a078ab0796


ib-web项目启动配置私仓：npm config set registry https://cmc.centralrepo.rnd.huawei.com/artifactory/api/npm/npm-central-repo/


-----------------------------------------------------------------

Fiddler的配置（localhost换成换成自己的ip）
EXACT:http://10.74.244.204:8000/umi.js	http://10.74.244.204:9002/umi.js

regex:http://10.74.244.204:8000/ib-web-zmy/(.*)	http://10.74.244.204:8000/$1

regex:http://10.74.244.204:8000/ib-portal-zmy/(.*)	http://10.74.244.102:8084/ib-portal/$1

https://aspjj.crm.huawei.com:684/portal-gateway/contract/contract-service/system/v1/electronicSign/queryOrderData    http://10.74.244.103:8088/contract-service/system/v1/electronicSign/queryOrderData

regex:https://aspjj.crm.huawei.com:684/portal-gateway/contract/contract-service/(.*)  http://10.74.244.103:8088/contract-service/$1

regex:.+/portal-gateway/contract/(.+)  http://localhost:3017/$1

-------------------------------------------------------------------


打包机器：7.212.194.45  	用户名：hwboss 密码：hwboss
归档机器：7.212.211.32 	用户名：remote 密码：remote@12




打包流程：(先选4，再选2, 就是打主干的包,打包好后下载下来丢到归档机器里去)
1、cd /build/
2、sh deploytools.sh
3、输入"4"
4、输入"2"
选左侧Scp、然后路径：/build/code/workspace/trunk_n3/ib-web/dist/  

归档机器：（先输入hsc，再输入版本号LG7018，再选1(进入哪个目录)）如LG7018, 归档目录是：/archive/NG3/NGBilling-SW_v300R024C00LG7018/Software/NG3/JAVABIN/bes  把包丢进来这就行
1、输入hsc
2、输入对应的版本号 
3、查看对应有哪些目录 ll



代码提交commit格式：
Description:描述
TraceNo:单号;单号;单号
PI:版本




vscode安装的插件：
1、Beautify
2、CodeMate
3、ESLint
4、Live Server
5、Prettier ESLint
6、Reactjs code snippets
7、Prettier - Code formatter
8、indent-rainbow


























lWX1521855@LWX1521855-RcyB MINGW64 /d/LZD/xm/forkMain/portal-web (wx1521855)
$ git commit --no-verify -m "Description: 电签第三期工单及人证照片查询页面和前端传渠道到报文头
TraceNo: AR20260616780176;AR20260616780154;AR20260616779405;
PI:V26.6.2.0"


lWX1521855@LWX1521855-RcyB MINGW64 /d/LZD/xm/forkMain/portal-web (wx1521855)
$ git push -f origin wx1521855



lWX1521855@LWX1521855-RcyB MINGW64 /d/LZD/xm/forkMain/portal-web (wx1521855)
$ git merge master



lWX1521855@LWX1521855-RcyB MINGW64 /d/LZD/xm/forkMain/portal-web (wx1521855)
$ git checkout wx1521855


lWX1521855@LWX1521855-RcyB MINGW64 /d/LZD/xm/forkMain/portal-web (wx1521855)
$ git pull upstream master


lWX1521855@LWX1521855-RcyB MINGW64 /d/LZD/xm/forkMain/portal-web (wx1521855)
$ git reset --mixed ca2959df6c791f3da6060f200df1cae917aacd5d


lWX1521855@LWX1521855-RcyB MINGW64 /d/LZD/xm/forkMain/portal-web (wx1521855)
$ git merge --abort


lWX1521855@LWX1521855-RcyB MINGW64 /d/LZD/xm/forkMain/portal-web (wx1521855)
$ git rebase -i HEAD~2


