#include "Employee.h"

#include "Client.h"
#include "FilesHelper.h"

void Employee::addClient(Client &client)
{
    FilesHelper::saveClient(client);
}

Client *Employee::searchClient(int id)
{
    vector<Client> clients = FilesHelper::getClients();

    for (const Client &client : clients)
    {
        if (client.getId() == id)
        {
            return new Client(client);
        }
    }

    return nullptr;
}

void Employee::listClient()
{
    vector<Client> clients = FilesHelper::getClients();

    for (const Client &client : clients)
    {
        client.display();
    }
}

void Employee::editClient(int id, string name, string password, double balance)
{
    vector<Client> clients = FilesHelper::getClients();

    for (Client &client : clients)
    {
        if (client.getId() == id)
        {
            client.setName(name);
            client.setPassword(password);
            client.setBalance(balance);
        }
    }

    FilesHelper::clearFile("Data/Clients.txt", "Data/ClientsLastId.txt");
    for (const Client &client : clients)
    {
        FilesHelper::saveClient(client);
    }
}
