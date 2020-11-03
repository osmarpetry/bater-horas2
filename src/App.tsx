import Axios, { AxiosError } from 'axios';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import useSWR, { mutate, trigger } from 'swr';
import useDebounce from 'useDebouce';
import { handPointHours } from 'utils/handpoint';

interface PontosData {
  created_at: Date;
  edited?: boolean;
  id: number;
  note: string;
  published_at?: Date;
  updated_at?: Date;
}

interface NotesProps {
  value: string;
  onChange: (value: string) => void;
}

function Notes({ value, onChange }: NotesProps) {
  const [stateValue, setStateValue] = useState(value);
  const sateValueDebouce = useDebounce(stateValue, 1000);

  useEffect(() => {
    onChange(sateValueDebouce);
  }, [onChange, sateValueDebouce]);

  return (
    <input
      placeholder="No notes"
      value={stateValue}
      onChange={(element) => setStateValue(element.target.value)}
    />
  );
}

function App() {
  const { data = [] } = useSWR<PontosData[], AxiosError>(
    'http://localhost:1337/pontos',
    (url: string) => Axios.get(url).then((data) => data.data)
  );

  return (
    <main>
      <h1>Bater horas</h1>
      <button
        onClick={async () => {
          const url = 'http://localhost:1337/pontos';
          console.info('Created at: ', new Date());
          mutate(
            url,
            [
              ...data,
              {
                created_at: new Date().toString(),
                note: '',
                id: data.length > 0 ? data[data.length - 1].id + 1 : 1,
              },
            ],
            false
          );
          await Axios.post('http://localhost:1337/pontos');
          trigger(url);
        }}
      >
        Create new point
      </button>
      <p>You worked {handPointHours(data).toFixed(2)} hours</p>
      {data.length % 2 !== 0 && <p>You should have do a exit handpoint</p> }
      <table>
        <thead>
          <tr>
            <td>Created At</td>
            <td>Notes</td>
          </tr>
        </thead>
        <tbody>
          {data?.map(({ created_at, note, id }) => {
            const handleNoteChange = (value: string) => {
              Axios.put(`http://localhost:1337/pontos/${id}`, { note: value });
            };

            return (
              <tr key={id}>
                <td>{format(new Date(created_at), 'yy-mm-dd HH:mm:ss')}</td>
                <td>
                  <Notes value={note} onChange={handleNoteChange} />
                </td>
                <td>
                  <button
                    onClick={async () => {
                      const url = 'http://localhost:1337/pontos';
                      console.info('Deleted at: ', id);
                      mutate(
                        url,
                        data.filter((item) => item.id !== id),
                        false
                      );
                      await Axios.delete(`http://localhost:1337/pontos/${id}`);
                      trigger(url);
                    }}
                  >
                    Apagar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}

export default App;
