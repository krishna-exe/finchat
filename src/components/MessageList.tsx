import { cn } from "@/lib/utils";
import { Message } from "ai/react";
import { Loader2, User, BotMessageSquare   } from "lucide-react";
import React from "react";
import ReactMarkdown from 'react-markdown';
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

type Props = {
  isLoading: boolean;
  messages: Message[];
};

function getOptions(code:string){
  console.log(`CODE::::::${code}`);
  code=code.replace(/`/g, "").replace(/,\s(?=\{)/g, ",");
  const startIndex = code.indexOf("r',{") + 3;
  const endIndex = code.lastIndexOf(")");
  console.log(`STARTINDEX::::::${startIndex}`);
  console.log(`ENDINDEX::::::${endIndex}`);
  const match = code.substring(startIndex, endIndex);
  console.log(`MATCH::::::${match}`)
  if (match) {
    return match;
  } else {
    console.error("Chart configuration not found");
    return {};
  }
}

const MessageList = ({ messages, isLoading }: Props) => {
  // if (isLoading) {
  //   return (
  //     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
  //       <Loader2 className="w-6 h-6 animate-spin" />
  //     </div>
  //   );
  // }
  const greetingMessage = {
    id: 'greeting',
    role: 'assistant',
    content: `Hello! How can I assist you today?\
      Ask me any question related to the uploaded report!\n`,
  }

  const allmessages = [greetingMessage,...messages];
  if (!allmessages) return <></>;
  return (
    <div className="flex flex-col gap-2 px-4">    
      {allmessages.map((message, index) => {
        return (
          <div
            key={message.id}
            className={cn("flex", {
              "justify-end pl-10": message.role === "user",
              "justify-start pr-10": message.role === "assistant",
            })}
          >
           
            <div
              className={cn(
                "mt-1 rounded-lg px-3 text-m py-2 shadow-md ring-1 ring-gray-900/10 ml-6 relative mb-3",
                {
                  "bg-blue-600 shadow-md ring-1 text-white mr-6 ": message.role === "user",
                }
              )}
            > 
            
              {(message.content.includes('Highcharts') && message.content.startsWith('```java') ) ?
                  <div style={{ width: '100%', height: '100%' }}>
                  <HighchartsReact
                      highcharts={Highcharts}
                      options={eval('('+getOptions(message.content)+')')}
                      containerProps={{ style: { width: '300px', height: '100%' } }}
                  />
              </div>
                :
                <p><ReactMarkdown>{message.content}</ReactMarkdown></p> 
              }                  
               {/* {icon} */}
              {message.role === 'user' ? 
                <User size={30} color='black'   
                      className="absolute top-1 -right-8 rounded-full shadow-lg ring-gray-900/10 ml-0 p-1"
                      style={{ marginLeft: '4px' }}/> : 
                <BotMessageSquare  size={30} color='black'  
                      className={`absolute top-1 -left-9 rounded-full shadow-lg ml-0 p-1 stroke-[#0842AB]
                      ${ 
                        isLoading && index===messages.length-1 ? 'animate-bounce' : ""
                      }` }/>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
